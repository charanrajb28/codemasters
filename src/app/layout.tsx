import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "@/styles/globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSA Execution & Assessment Platform",
  description: "High-performance Data Structures & Algorithms practice platform with AWS Kubernetes code execution engine and Admin Portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${figtree.className}`} suppressHydrationWarning>
      <body className={`${figtree.className} font-sans bg-black text-white antialiased selection:bg-emerald-500 selection:text-black`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

