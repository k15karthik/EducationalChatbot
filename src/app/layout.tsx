import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black">
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}