'use client';
// components/layout/SiteHeader.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RotateCcw, Sparkles, Menu, X } from 'lucide-react';
import { useLang, LangToggle } from '@/components/i18n/LangProvider';

interface SiteHeaderProps {
  onReplayIntro?: () => void;
}

export function SiteHeader({ onReplayIntro }: SiteHeaderProps) {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t }     = useLang();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === '/';

  const navLinks = isHome
    ? [
        { label: t('nav.home'),          href: '#readings' },
        { label: t('nav.chart'),         href: '#birthchart' },
        { label: t('nav.forecast'),      href: '#dream' },
        { label: t('nav.home'),          href: '#about' },
      ]
    : [
        { label: t('nav.home'),          href: '/' },
        { label: t('nav.chart'),         href: '/chart' },
        { label: t('nav.forecast'),      href: '/forecast' },
        { label: t('nav.compatibility'), href: '/compatibility' },
        { label: t('nav.lifeCycles'),    href: '/life-cycles' },
        { label: t('nav.journal'),       href: '/journal' },
        { label: t('nav.electional'),    href: '/electional' },
        { label: t('nav.dashboard'),     href: '/dashboard' },
      ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold tracking-wider"
        >
          <Sparkles className="h-5 w-5" style={{ color: 'var(--neon-cyan)' }} />
          <span className="neon-text-cyan">آثير</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label + link.href}
                href={link.href}
                className="text-sm font-sans tracking-wide transition-colors duration-300 hover:text-[var(--neon-cyan)]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label + link.href}
                href={link.href}
                className="text-sm font-sans tracking-wide transition-colors duration-300 hover:text-[var(--neon-cyan)]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <LangToggle className="hidden md:inline-flex" />

          {onReplayIntro ? (
            <button
              onClick={onReplayIntro}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur hover:bg-white/10 md:inline-flex"
            >
              <RotateCcw className="h-4 w-4" />
              {t('nav.replayIntro')}
            </button>
          ) : null}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur hover:bg-white/10 md:hidden"
            aria-label="فتح القائمة"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="glass-panel mx-4 mt-3 rounded-3xl p-4 md:hidden">
          <div className="grid gap-2">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label + link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label + link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl px-4 py-3 text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="mt-2 flex items-center justify-between rounded-2xl px-4 py-3 bg-white/5">
              <LangToggle />
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-white/90 hover:text-[var(--neon-cyan)] text-sm"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
