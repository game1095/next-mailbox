import type { Metadata } from "next";
import { Sarabun } from "next/font/google";

// ✨ ตรวจสอบว่ามีการ import 2 บรรทัดนี้ ✨
import "./globals.css";
import "leaflet/dist/leaflet.css";

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
    <html lang="th">
      <body className={sarabun.className}>{children}</body>
    </html>
  );
}
