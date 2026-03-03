import { HeroSection } from '@/components/hero/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { BirthChartSection } from '@/components/sections/BirthChartSection';
import { DreamSection } from '@/components/sections/DreamSection';
import { AboutSection } from '@/components/sections/AboutSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <div className="mx-auto max-w-xs my-10">
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.25), transparent)' }}
        />
      </div>

      <FeaturesSection />
      <BirthChartSection />
      <DreamSection />
      <AboutSection />
    </>
  );
}
