"use client"

import { ScrollReveal } from "@/components/animations/ScrollReveal"
import DreamForm from "@/components/forms/DreamForm"
import { Sparkles } from "lucide-react"

export function DreamSection() {
  return (
    <section id="dream" className="relative py-32 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl relative">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Dream Interpreter
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
              Interpret your dreams with cosmic context
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Write your dream, and the system will blend symbolic analysis with lunar phase + key transits to produce a culturally resonant interpretation.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <DreamForm />
        </ScrollReveal>
      </div>
    </section>
  )
}
