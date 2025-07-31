import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/libs/Provider"; // Import QueryProvider
import { Inter } from "next/font/google";
import Player from "@/components/Player";

<<<<<<< HEAD
=======
const inter = Inter({ subsets: ["latin"] });

>>>>>>> beta
export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Remaster",
  },
  description: "Where music meets creativity",
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
<<<<<<< HEAD
      <head>
        <link rel="icon" href="/faviconreal.png" type="image/x-icon" />
      </head>

      <body>{children}</body>
=======
      <body className={`${inter.className} antialiased`}>
        <Provider>
          {children}
          <Player />
        </Provider>
      </body>
>>>>>>> beta
    </html>
  );
}
