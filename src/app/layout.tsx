import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/src/components/ui/sonner";
import "./globals.css";

import { Providers } from "@/src/components/providers";
import { getCsrfTokenFromServer } from "@/lib/csrf/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const csrfToken = await getCsrfTokenFromServer();

  return {
    title: "Entrostat - OTP Generator",
    description: "Entrostat - OTP Generator",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    other: {
      "x-csrf-token": csrfToken ?? "",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
