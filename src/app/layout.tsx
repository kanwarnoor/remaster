import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/libs/Provider";
import Navbar from "./components/Navbar";
import {Inter} from "next/font/google"

const inter = Inter({subsets: ['latin']})


export const metadata: Metadata = {
  title: "Remaster",
  description: "Where music meets creativity",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
          <Navbar />
          <Provider>{children}</Provider>
      </body>
    </html>
  );
}
