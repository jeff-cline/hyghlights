import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import RecaptchaProvider from "@/components/RecaptchaProvider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Without this, Next resolves og:image against the origin the SERVER sees —
  // which behind nginx is http://localhost:3060. Every shared card would have
  // handed Facebook, X and iMessage a localhost image URL and unfurled with no
  // picture at all, while looking perfectly correct in the page source.
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://hyghlights.com"),
  title: "hYghlights — Celebrate every win",
  description:
    "A daily ritual to capture your hYghlights, honor your progress, and celebrate your wins. Powered by the iTHRIVE framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Attaches a reCAPTCHA token to every guarded form submission.
            Inert until RECAPTCHA_SITE_KEY/SECRET_KEY are set. */}
        <RecaptchaProvider />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
