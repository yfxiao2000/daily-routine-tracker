import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Daily Routine Tracker",
  description: "Track your daily tasks and build good habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
