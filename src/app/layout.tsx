import type { Metadata } from "next";
import "./globals.css";
import connectDb from "@/libs/connectDb";
import Provider from "@/libs/Provider";

export const metadata: Metadata = {
  title: "Remaster",
  description: "Where music meets creativity",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectDb();
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
