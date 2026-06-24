import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagnostic Dirigeant — Osalys",
  description:
    "Découvrez votre profil de dirigeant en moins de 5 minutes. Résultat instantané, personnalisé et gratuit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${sora.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-canvas text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
