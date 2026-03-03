// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Noto_Kufi_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
});

// ── Site-wide branding constant ───────────────────────────────
export const SITE_META = {
  titleAr:       'آثير بغداد — منصة فلك وأبراج عربية',
  titleEn:       'Aether Baghdad — Arabic Astrology Platform',
  descriptionAr: 'منصة عربية أولاً لتحليل خريطة الميلاد، التوافق الفلكي، التوقعات، ويومياتك الفلكية — بتجربة سينمائية فضائية.',
  descriptionEn: 'Arabic-first platform for birth chart analysis, compatibility, forecasts, and astro journaling — with a cinematic cosmic experience.',
  copyright:     '© جميع الحقوق محفوظة لحسن محمد',
  copyrightEn:   '© All rights reserved to Hassan Mohammed',
  author:        'Hassan Mohammed',
} as const;

export const metadata: Metadata = {
  title:       SITE_META.titleAr,
  description: SITE_META.descriptionAr,
  authors:     [{ name: SITE_META.author }],
  keywords:    ['فلك', 'أبراج', 'خريطة الميلاد', 'astrology', 'birth chart', 'horoscope', 'Baghdad'],
  openGraph: {
    title:       SITE_META.titleAr,
    description: SITE_META.descriptionAr,
    locale:      'ar_IQ',
    type:        'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor:   '#050510',
  width:        'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Default: Arabic RTL — LangProvider will update dynamically on client
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${notoKufiArabic.variable} font-sans antialiased`}
      >
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
