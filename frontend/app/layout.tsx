import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { UserProvider } from '@/context/UserContext';
import Head from 'next/head';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Arbor Coup",
  description: "Coup for the ladies and gentlemen of Arbor St.",
  icons: {
    icon: '/images/trees.svg',
    apple: '/images/trees.svg',
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com"  />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col gap-20 items-center">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                  <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </nav>
                <div className="flex flex-col gap-20 max-w-5xl p-5">
                  {children}
                </div>
              </div>
            </main>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
