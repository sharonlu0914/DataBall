import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSession } from "@/lib/auth";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

const condensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-condensed",
});

export const metadata: Metadata = {
  title: {
    default: "DataBall",
    template: "%s · DataBall",
  },
  description: "School sports analytics and media platform.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${condensed.variable} flex min-h-full flex-col bg-paper font-sans text-berkeley antialiased`}
      >
        <SiteHeader email={session?.email} role={session?.role} name={session?.name} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
