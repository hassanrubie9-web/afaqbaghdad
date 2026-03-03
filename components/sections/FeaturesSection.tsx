"use client"

import { ScrollReveal } from "@/components/animations/ScrollReveal"
import { Moon, Star, Sun, Orbit, Eye, Flame } from "lucide-react"

const features = [
  {
    icon: Moon,
    title: "Dream Interpretation",
    description:
      "AI-powered analysis of your dreams through the lens of celestial symbolism. Decode the messages your subconscious sends.",
    accentColor: "var(--neon-purple)",
    glowColor: "rgba(180, 74, 255, 0.15)",
  },
  {
    icon: Star,
    title: "Birth Chart Analysis",
    description:
      "Comprehensive natal chart readings that map the stars at your moment of birth, revealing your cosmic blueprint.",
    accentColor: "var(--neon-cyan)",
    glowColor: "rgba(0, 240, 255, 0.15)",
  },
  {
    icon: Sun,
    title: "Daily Horoscope",
    description:
      "Personalized celestial forecasts updated every dawn, aligned with your unique astrological signature.",
    accentColor: "var(--neon-gold)",
    glowColor: "rgba(255, 215, 0, 0.15)",
  },
  {
    icon: Orbit,
    title: "Transit Tracking",
    description:
      "Real-time planetary transit analysis showing how cosmic movements influence your personal energy fields.",
    accentColor: "var(--neon-cyan)",
    glowColor: "rgba(0, 240, 255, 0.15)",
  },
  {
    icon: Eye,
    title: "Synastry Reports",
    description:
      "Discover the celestial chemistry between two souls. Compatibility analysis through the language of the stars.",
    accentColor: "var(--neon-purple)",
    glowColor: "rgba(180, 74, 255, 0.15)",
  },
  {
    icon: Flame,
    title: "Cosmic Meditation",
    description:
      "Guided meditation journeys aligned with current planetary alignments for deeper spiritual connection.",
    accentColor: "var(--neon-gold)",
    glowColor: "rgba(255, 215, 0, 0.15)",
  },
]

export function FeaturesSection() {
  return (
    <section id="readings" className="relative py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-16 text-center">
          <p
            className="mb-3 text-sm font-sans tracking-[0.3em] uppercase"
            style={{ color: "var(--neon-cyan-dim)" }}
          >
            Celestial Services
          </p>
          <h2 className="font-serif text-4xl font-bold md:text-5xl text-balance">
            <span style={{ color: "var(--foreground)" }}>Illuminate Your </span>
            <span className="neon-text-purple">Path</span>
          </h2>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <div
                className="glass-panel group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02]"
                style={{
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = feature.accentColor
                  el.style.boxShadow = `0 0 30px ${feature.glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = "transparent"
                  el.style.boxShadow = ""
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: feature.glowColor,
                    border: `1px solid ${feature.accentColor}33`,
                  }}
                >
                  <feature.icon
                    className="h-6 w-6"
                    style={{ color: feature.accentColor }}
                  />
                </div>

                <h3
                  className="font-serif text-xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
