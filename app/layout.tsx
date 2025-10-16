import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { NextThemesProvider } from "./providers"; // Import the new provider

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Next Mailbox",
  description: "Mailbox Information Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={sarabun.className}>
        {/* Wrap your app with the provider */}
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
