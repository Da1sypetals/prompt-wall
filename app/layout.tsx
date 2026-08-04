import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500"],
  variable: "--font-fraunces",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Prompt Wall",
  description: "A beautiful prompt management tool",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
