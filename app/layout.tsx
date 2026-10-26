
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auto Manager",
  description: "Gestione personale delle automobili",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Auto Manager",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
