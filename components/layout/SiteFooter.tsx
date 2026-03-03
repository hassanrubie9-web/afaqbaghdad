'use client';
// components/layout/SiteFooter.tsx

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

export function SiteFooter() {
  const { t } = useLang();

  return (
    <footer
      className="relative py-16 px-4"
      style={{ borderTop: '1px solid rgba(0, 240, 255, 0.08)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-lg font-bold tracking-wider"
        >
          <Sparkles className="h-4 w-4" style={{ color: 'var(--neon-cyan)' }} />
          <span className="neon-text-cyan">آثير بغداد</span>
        </Link>

        {/* Tagline */}
        <p
          className="max-w-md text-sm leading-relaxed"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {t('footer.tagline')}
        </p>

        {/* Quick links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {(
            [
              { key: 'nav.chart',         href: '/chart' },
              { key: 'nav.compatibility', href: '/compatibility' },
              { key: 'nav.lifeCycles',    href: '/life-cycles' },
              { key: 'nav.journal',       href: '/journal' },
              { key: 'nav.electional',    href: '/electional' },
            ] as const
          ).map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-sans tracking-wide transition-colors duration-300 hover:text-[var(--neon-cyan)]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Legal links */}
        <div className="flex gap-6">
          {(['footer.privacy', 'footer.terms', 'footer.contact'] as const).map(
            (k) => (
              <a
                key={k}
                href="#"
                className="text-xs font-sans tracking-wide transition-colors duration-300 hover:text-[var(--neon-cyan)]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {t(k)}
              </a>
            )
          )}
        </div>

        {/* Copyright — Arabic primary + English secondary */}
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-sm font-medium"
            style={{ color: 'rgba(180, 130, 255, 0.8)' }}
          >
            © {new Date().getFullYear()} — {t('footer.copy')}
          </p>
          <p
            className="text-xs"
            style={{ color: 'rgba(128, 128, 176, 0.5)' }}
          >
            © All rights reserved to Hassan Mohammed
          </p>
        </div>
      </div>
    </footer>
  );
}
