import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/seo/get-site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const metadataBase = new URL(settings.siteUrl)

  const defaultOgImage = settings.defaultShareImage
    ? [
        {
          url: settings.defaultShareImage.url,
          alt: settings.defaultShareImage.alt,
          width: settings.defaultShareImage.width ?? 1200,
          height: settings.defaultShareImage.height ?? 630,
        },
      ]
    : undefined

  const robots = settings.preventIndexing
    ? {
        index: false,
        follow: false,
      }
    : {
        index: true,
        follow: true,
      }

  return {
    metadataBase,
    title: {
      default: settings.defaultTitle,
      template: settings.titleTemplate,
    },
    description: settings.defaultDescription,
    alternates: {
      canonical: "/",
    },
    robots,
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.siteName,
      title: settings.defaultTitle,
      description: settings.defaultDescription,
      images: defaultOgImage,
    },
    twitter: {
      card: "summary_large_image",
      site: settings.twitterHandle ?? undefined,
      title: settings.defaultTitle,
      description: settings.defaultDescription,
      images: defaultOgImage?.map((img) => img.url),
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh bg-background text-foreground antialiased",
        ].join(" ")}
      >
        {/* Non-Tailwind note: Theme switching (Light/Dark/System) is handled by next-themes. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
