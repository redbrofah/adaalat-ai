import type { Metadata } from "next";
import { Inter, Playfair_Display, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/lib/i18n/context";
import { UserProvider } from "@/lib/auth/context";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AdaalatAI",
  description: "An AI bench clerk for the forgotten courts of Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        inter.variable,
        playfair.variable,
        hindSiliguri.variable,
      )}
    >
      <body className="antialiased bg-[#0a1628] text-stone-100 min-h-screen">
        <UserProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
