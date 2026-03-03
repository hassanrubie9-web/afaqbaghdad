"use client"

import { ScrollReveal } from "@/components/animations/ScrollReveal"
import BirthChartForm from "@/components/forms/BirthChartForm"
import { Orbit } from "lucide-react"

export function BirthChartSection() {
  return (
    <section id="birthchart" className="relative py-32 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-0 h-[520px] w-[520px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl relative">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              <Orbit className="h-4 w-4 text-purple-300" />
              Birth Chart
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
              Generate a precise natal chart
            </h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Enter birth data and location. We resolve timezone automatically and compute chart + houses on the server, returning JSON results you can expand later into a full visual wheel.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <BirthChartForm />
        </ScrollReveal>
      </div>
    </section>
  )
}
