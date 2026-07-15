import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gloss.app"),
  title: {
    default: "Gloss — Learn every word you read",
    template: "%s · Gloss",
  },
  description:
    "Snap a page, tap a word, and get its meaning in context. Save it, review it with spaced repetition, and finally own the words you read.",
  openGraph: {
    title: "Gloss — Learn every word you read",
    description:
      "Snap a page, tap a word, and get its meaning in context. Your personal vocabulary, built from what you actually read.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  applicationName: "Gloss",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8EF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen font-body text-ink antialiased">
        <AuthProvider>
          <NavBar />
          <main className="mx-auto max-w-3xl px-4 pb-6 pt-6" data-testid="app-main">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
