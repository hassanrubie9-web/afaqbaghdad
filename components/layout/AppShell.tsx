'use client';
// components/layout/AppShell.tsx

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { StarfieldCanvas }    from '@/components/cinematic/StarfieldCanvas';
import { FilmOverlay }        from '@/components/cinematic/FilmOverlay';
import { IntroVideoOverlay }  from '@/components/cinematic/IntroVideoOverlay';
import { SiteHeader }         from '@/components/layout/SiteHeader';
import { SiteFooter }         from '@/components/layout/SiteFooter';
import { LangProvider }       from '@/components/i18n/LangProvider';
import { Toaster }            from '@/components/ui/sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [introComplete, setIntroComplete] = useState(false);
  const [forceReplay,   setForceReplay]   = useState(false);

  const showIntro = !pathname?.startsWith('/auth');

  useEffect(() => {
    if (!showIntro) setIntroComplete(true);
  }, [showIntro]);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setForceReplay(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    setIntroComplete(false);
    setForceReplay(true);
  }, []);

  return (
    <LangProvider>
      {showIntro && !introComplete && (
        <IntroVideoOverlay onComplete={handleIntroComplete} forceReplay={forceReplay} />
      )}

      <StarfieldCanvas />
      <FilmOverlay />
      <Toaster richColors position="top-center" />

      <div
        className={`relative z-10 transition-all duration-700 ${
          introComplete ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SiteHeader onReplayIntro={handleReplayIntro} />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </LangProvider>
  );
}
