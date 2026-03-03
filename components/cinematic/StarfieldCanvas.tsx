"use client"

import { useEffect, useRef, useCallback } from "react"

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface ConstellationLine {
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
  fadeIn: number
  fadeOut: number
  duration: number
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const starsRef = useRef<Star[]>([])
  const linesRef = useRef<ConstellationLine[]>([])
  const visibleRef = useRef(true)
  const reducedMotionRef = useRef(false)

  const initStars = useCallback((width: number, height: number) => {
    const isMobile = width < 768
    const count = isMobile ? 120 : 300
    const stars: Star[] = []

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2,
      })
    }
    starsRef.current = stars
  }, [])

  const spawnConstellation = useCallback((width: number, height: number, time: number) => {
    const cx = Math.random() * width
    const cy = Math.random() * height
    const pointCount = Math.floor(Math.random() * 3) + 3
    const points: { x: number; y: number }[] = []

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
      })
    }

    for (let i = 0; i < points.length - 1; i++) {
      linesRef.current.push({
        x1: points[i].x,
        y1: points[i].y,
        x2: points[i + 1].x,
        y2: points[i + 1].y,
        opacity: 0,
        fadeIn: time,
        fadeOut: time + 4000 + Math.random() * 3000,
        duration: 1500,
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)

    const handleVisibility = () => {
      visibleRef.current = !document.hidden
    }
    document.addEventListener("visibilitychange", handleVisibility)

    let lastConstellationTime = 0

    const animate = (time: number) => {
      if (!visibleRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle = reducedMotionRef.current
          ? star.opacity
          : star.opacity *
            (0.5 +
              0.5 *
                Math.sin(time * star.twinkleSpeed + star.twinkleOffset))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${twinkle})`
        ctx.fill()
      }

      // Spawn constellation lines periodically
      if (!reducedMotionRef.current && time - lastConstellationTime > 6000) {
        spawnConstellation(canvas.width, canvas.height, time)
        lastConstellationTime = time
      }

      // Draw constellation lines
      linesRef.current = linesRef.current.filter((line) => {
        let alpha = 0
        if (time < line.fadeIn + line.duration) {
          alpha = ((time - line.fadeIn) / line.duration) * 0.25
        } else if (time < line.fadeOut) {
          alpha = 0.25
        } else if (time < line.fadeOut + line.duration) {
          alpha = (1 - (time - line.fadeOut) / line.duration) * 0.25
        } else {
          return false
        }

        line.opacity = Math.max(0, alpha)
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.strokeStyle = `rgba(0, 240, 255, ${line.opacity})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Draw endpoint dots
        for (const pt of [
          { x: line.x1, y: line.y1 },
          { x: line.x2, y: line.y2 },
        ]) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 240, 255, ${line.opacity * 2})`
          ctx.fill()
        }

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [initStars, spawnConstellation])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}
