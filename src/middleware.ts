import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Everything under the app (the daily ritual, jars, groups, settings) requires
// a signed-in shared account. Public: the landing page, /login, /signup.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/home/:path*',
    '/community/:path*',
    '/recap/:path*',
    '/onboarding/:path*',
    '/jar/:path*',
    '/groups/:path*',
    '/bottles/:path*',
    '/settings/:path*',
  ],
}
