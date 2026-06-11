import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Derycash",
  description: "O app que mostra quanto dinheiro voce realmente pode usar."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
