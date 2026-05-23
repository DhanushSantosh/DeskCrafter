import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskCrafter - Linux Launcher Suite",
  description:
    "Create, validate, repair, and manage Linux desktop entries, AppImages, scripts, URLs, icons, and categories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
