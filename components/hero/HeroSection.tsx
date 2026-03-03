"use client"

import { useEffect, useRef } from "react"
import { ZodiacWheel } from "./ZodiacWheel"

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReduced) return

    // Parallax scroll effect
    const handleScroll = () => {
      if (!heroRef.current) return
      const scrollY = window.scrollY
      const rate = scrollY * 0.3
      heroRef.current.style.transform = `translateY(${rate}px)`
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Entrance animation
    const els = [titleRef.current, subtitleRef.current, ctaRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = "0"
      el.style.transform = "translateY(30px)"
      el.style.transition = `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.2}s`
      requestAnimationFrame(() => {
        el.style.opacity = "1"
        el.style.transform = "translateY(0)"
      })
    })
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
    >
      {/* Nebula background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0, 240, 255, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 70% 60%, rgba(180, 74, 255, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 30% 70%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Zodiac wheel behind text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
        <ZodiacWheel size={600} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3 rounded-full px-5 py-2 glass-panel">
          <div
            className="h-2 w-2 rounded-full animate-pulse-glow"
            style={{ background: "var(--neon-cyan)" }}
          />
          <span
            className="text-sm font-sans tracking-widest uppercase"
            style={{ color: "var(--neon-cyan-dim)" }}
          >
            Celestial Navigation Active
          </span>
        </div>

        <h1
          ref={titleRef}
          className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="neon-text-cyan">Aether</span>{" "}
          <span style={{ color: "var(--foreground)" }}>Astrology</span>
        </h1>

        <p
          ref={subtitleRef}
          className="max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: "var(--muted-foreground)" }}
        >
          Navigate the cosmic currents of your destiny. AI-powered celestial
          readings, dream interpretation, and birth chart analysis forged in
          the light of distant stars.
        </p>

        <div ref={ctaRef} className="flex flex-col gap-4 sm:flex-row">
          <button
            className="group relative overflow-hidden rounded-xl px-8 py-3.5 font-sans text-base font-medium transition-all duration-300 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))",
              color: "#050510",
              boxShadow:
                "0 0 20px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)",
            }}
          >
            <span className="relative z-10">Begin Your Reading</span>
          </button>

          <button
            className="rounded-xl px-8 py-3.5 font-sans text-base font-medium transition-all duration-300 glass-panel hover:scale-105"
            style={{
              color: "var(--neon-cyan)",
              borderColor: "rgba(0, 240, 255, 0.25)",
            }}
          >
            Explore the Cosmos
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-float">
        <span
          className="text-xs font-sans tracking-widest uppercase"
          style={{ color: "var(--muted-foreground)" }}
        >
          Scroll to Discover
        </span>
        <div
          className="h-10 w-6 rounded-full flex items-start justify-center pt-2"
          style={{ border: "1px solid rgba(0, 240, 255, 0.3)" }}
        >
          <div
            className="h-2 w-1 rounded-full animate-pulse-glow"
            style={{ background: "var(--neon-cyan)" }}
          />
        </div>
      </div>
    </section>
  )
}
