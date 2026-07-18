import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma 7: the runtime client connects via an explicit driver adapter.
// This app runs on its OWN Postgres database (one DB per app — the same
// pattern as every other site on the server), so the default `public` schema
// already isolates it. Set DATABASE_SCHEMA only when sharing one database via
// a named schema (e.g. an external managed DB); left unset it uses `public`.
const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const schema = process.env.DATABASE_SCHEMA
const adapter = new PrismaPg(
  { connectionString: url },
  schema ? { schema } : undefined,
)

const g = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = g.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') g.prisma = prisma
