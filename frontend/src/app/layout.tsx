
import "./globals.css";
import Link from "next/link";
import { ChatProvider } from "./components/ChatContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black">
        <ChatProvider>
          <main className="p-6">{children}</main>
        </ChatProvider>
      </body>
    </html>
  );
}