import type { Metadata } from "next";
import "./globals.css";
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
      <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
      <body className={`${inter.className} antialiased`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
