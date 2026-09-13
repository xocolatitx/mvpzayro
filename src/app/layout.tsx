import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAYRO CRM",
  description: "Tu sistema operativo de nightlife — clientes, eventos, reservas y ZAYRO Score",
  applicationName: "ZAYRO CRM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZAYRO",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} dark h-full`}>
      <body
        className="min-h-dvh bg-black font-sans text-white antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
