"use client"

import { ScrollReveal } from "@/components/animations/ScrollReveal"

const stats = [
  { value: "12M+", label: "Readings Delivered", color: "var(--neon-cyan)" },
  { value: "99.7%", label: "Accuracy Rate", color: "var(--neon-purple)" },
  { value: "144", label: "Celestial Models", color: "var(--neon-gold)" },
  { value: "24/7", label: "Cosmic Access", color: "var(--neon-cyan)" },
]

export function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-4 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-16 text-center">
          <p
            className="mb-3 text-sm font-sans tracking-[0.3em] uppercase"
            style={{ color: "var(--neon-cyan-dim)" }}
          >
            About Aether
          </p>
          <h2 className="mx-auto mb-6 max-w-2xl font-serif text-4xl font-bold md:text-5xl text-balance">
            <span style={{ color: "var(--foreground)" }}>
              Where Ancient Wisdom Meets{" "}
            </span>
            <span className="neon-text-cyan">AI</span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            Aether Astrology bridges thousands of years of celestial knowledge
            with cutting-edge artificial intelligence. Our models are trained on
            the combined wisdom of every major astrological tradition, from
            Vedic Jyotish to Western tropical astrology.
          </p>
        </ScrollReveal>

        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 100}>
              <div className="glass-panel flex flex-col items-center gap-2 rounded-2xl p-8 text-center transition-all duration-500 hover:scale-[1.03]">
                <span
                  className="font-serif text-4xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-sm font-sans"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
