import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/libs/Provider"; // Import QueryProvider
import { Inter } from "next/font/google";
import Player from "@/components/Player";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Remaster",
  },
  description: "Where music meets ownership",
  icons: {
    icon: "/favicon.ico",
  },
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
          <Player />
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
