import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTeamFit App Demo",
  description: "VTeamFit training app demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-carbon text-white">
        {children}
      </body>
    </html>
  );
}
