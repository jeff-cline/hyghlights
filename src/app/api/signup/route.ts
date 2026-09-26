import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findIdentity, createIdentity } from '@/lib/identity'
import {
  isBeyondLimitsMember, SSO_WELCOME_TITLE, SSO_WELCOME_BODY, PLAIN_EXISTS_MESSAGE,
} from '@/lib/account-origin'
import { BOOTCAMP_COUPON, BOOTCAMP_URL } from '@/lib/bootcamp-offer'
import { guardForm } from "@/lib/form-guard";

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const gate = await guardForm(req, "signup", (json ?? {}) as Record<string, unknown>, {
    names: [(json as Record<string, unknown> | null)?.name as string | undefined],
    email: (json as Record<string, unknown> | null)?.email as string | undefined,
  })
  if (gate.blocked) return gate.response
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
  }
  const { email, name, password } = parsed.data

  // A collision is not necessarily a mistake. One User row serves both
  // products, so an address "already taken" here often belongs to a Beyond
  // Limits member who has never opened HYghLights — and telling them only
  // "that email is taken" hides the single sign-on that is the whole point.
  const existing = await findIdentity(email)
  if (existing) {
    if (isBeyondLimitsMember(existing.id)) {
      return NextResponse.json({
        error: SSO_WELCOME_TITLE,
        sso: true,
        origin: 'beyondlimits',
        title: SSO_WELCOME_TITLE,
        body: SSO_WELCOME_BODY,
      }, { status: 409 })
    }
    return NextResponse.json({ error: PLAIN_EXISTS_MESSAGE, sso: false }, { status: 409 })
  }

  await createIdentity(email, name ?? null, password)

  // Brand new to both products. This is the one moment they are guaranteed to
  // be looking at us with nothing else to do, so it is where the Beyond Limits
  // offer goes. The code is checked and applied by Beyond Limits, not here.
  return NextResponse.json({
    ok: true,
    offer: {
      headline: 'Join Beyond Limits Bootcamp',
      sub: 'Make the Shift',
      discount: '10% off',
      code: BOOTCAMP_COUPON,
      href: `${BOOTCAMP_URL}/signup?coupon=${BOOTCAMP_COUPON}`,
    },
  })
}
