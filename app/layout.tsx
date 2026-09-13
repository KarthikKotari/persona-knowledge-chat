import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persona Knowledge Chat",
  description: "Chat with AI personas grounded in a shared knowledge base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="top-nav">
          <nav className="top-nav__inner">
            <Link href="/" className="top-nav__link">
              Chat
            </Link>
            <Link href="/kb" className="top-nav__link">
              Knowledge Base
            </Link>
          </nav>
        </header>
        <main className="page-content">{children}</main>
      </body>
    </html>
  );
}
