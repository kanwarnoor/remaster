import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Provider from "@/libs/Provider"; // Import QueryProvider
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remaster",
  description: "Where music meets creativity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Provider>

          {children}
        </Provider>
      </body>
    </html>
  );
}
