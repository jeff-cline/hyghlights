// Transactional email via the shared Core service (Zapmail).
//
// Best-effort and never throws — a page that fails because a mail server was
// slow is worse than a mail that arrives late. The boolean is there for the
// rare caller that genuinely needs to know, not for the common one.
export async function coreEmail(to: string, subject: string, html: string): Promise<boolean> {
  const base = process.env.CORE_BASE
  const key = process.env.CORE_KEY
  const sec = process.env.CORE_SECRET
  if (!base || !key || !sec) return false
  try {
    const r = await fetch(`${base}/api/core/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-core-key': key, 'x-core-secret': sec },
      body: JSON.stringify({ to, subject, html, provider: 'zapmail' }),
      signal: AbortSignal.timeout(15000),
    })
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean }
    return !!(r.ok && (j.ok === undefined || j.ok))
  } catch {
    return false
  }
}
