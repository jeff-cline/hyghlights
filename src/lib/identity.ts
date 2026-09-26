import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

// Shared account store. hYghlights and Beyond Limits authenticate against the
// SAME `User` table (in the Beyond Limits database) so one email + password
// works on both. We talk to it directly over pg — never with Prisma db push,
// so hYghlights migrations can't touch that table.
const g = globalThis as unknown as { identityPool?: Pool }
const pool =
  g.identityPool ??
  new Pool({ connectionString: process.env.IDENTITY_DATABASE_URL, max: 3 })
if (process.env.NODE_ENV !== 'production') g.identityPool = pool

export type Identity = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  mustChangePassword: boolean
}

const SELECT = `id, email, name, role, "isActive", "mustChangePassword", "passwordHash"`

export async function verifyIdentity(email: string, password: string): Promise<Identity | null> {
  const clean = email.toLowerCase().trim()
  const { rows } = await pool.query(`SELECT ${SELECT} FROM "User" WHERE email = $1`, [clean])
  const u = rows[0]
  if (!u || !u.isActive) return null
  const ok = await bcrypt.compare(password, u.passwordHash)
  if (!ok) return null
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    mustChangePassword: u.mustChangePassword,
  }
}

export async function findIdentity(email: string): Promise<Identity | null> {
  const clean = email.toLowerCase().trim()
  const { rows } = await pool.query(`SELECT ${SELECT} FROM "User" WHERE email = $1`, [clean])
  const u = rows[0]
  if (!u) return null
  return { id: u.id, email: u.email, name: u.name, role: u.role, isActive: u.isActive, mustChangePassword: u.mustChangePassword }
}

// Standalone hYghlights sign-up: creates the account in the shared table, so
// it immediately works on Beyond Limits too. Default role is the lowest tier.
export async function createIdentity(email: string, name: string | null, password: string): Promise<Identity> {
  const clean = email.toLowerCase().trim()
  const hash = await bcrypt.hash(password, 12)
  const id = `hy_${randomUUID()}`
  const { rows } = await pool.query(
    `INSERT INTO "User" (id, email, name, "passwordHash", role, "isActive", "mustChangePassword", "createdAt")
     VALUES ($1, $2, $3, $4, 'EXECUTIVE', true, false, now())
     RETURNING ${SELECT}`,
    [id, clean, name, hash],
  )
  const u = rows[0]
  return { id: u.id, email: u.email, name: u.name, role: u.role, isActive: u.isActive, mustChangePassword: u.mustChangePassword }
}

/**
 * Set a new password on the shared account.
 *
 * Writes to the same `User` row both products authenticate against, which is
 * the whole point: a reset started on hYghlights changes the password on
 * Beyond Limits too, because there was only ever one password.
 *
 * Also clears `mustChangePassword` — somebody who just chose a password has
 * done the thing that flag was asking for, and being made to choose again on
 * the next screen reads as the reset having failed.
 *
 * Returns false when no such account exists, so the caller can stay quiet
 * about it rather than confirming which addresses are registered.
 */
export async function setIdentityPassword(email: string, password: string): Promise<boolean> {
  const clean = email.toLowerCase().trim()
  const hash = await bcrypt.hash(password, 12)
  const { rowCount } = await pool.query(
    `UPDATE "User" SET "passwordHash" = $2, "mustChangePassword" = false
      WHERE email = $1 AND "isActive" = true`,
    [clean, hash],
  )
  return (rowCount ?? 0) > 0
}
