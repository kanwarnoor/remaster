import type { Metadata } from "next";
import "./globals.css";
import connectDb from "@/libs/connectDb";

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
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}