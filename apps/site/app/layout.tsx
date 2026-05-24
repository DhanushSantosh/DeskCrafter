import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskCrafter - Linux Desktop Repair Suite",
  description:
    "Repair Linux launchers, startup entries, MIME defaults, Flatpak permissions, ownership drift, and service-dependent integrations from one local-first desktop suite.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23ff0f39'/%3E%3Cpath fill='white' d='M19 16h16c8 0 14 6 14 16s-6 16-14 16H19V16Zm10 9v14h5c4 0 7-3 7-7s-3-7-7-7h-5Z'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
