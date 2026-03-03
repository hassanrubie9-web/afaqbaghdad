"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X } from "lucide-react"

const STORAGE_KEY = "aether_intro_seen_v1"

interface IntroVideoOverlayProps {
  onComplete: () => void
  forceReplay?: boolean
}

export function IntroVideoOverlay({
  onComplete,
  forceReplay = false,
}: IntroVideoOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (forceReplay) {
      setVisible(true)
      return
    }

    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (seen) {
        onComplete()
        return
      }
    } catch {
      // localStorage unavailable
    }
    setVisible(true)
  }, [forceReplay, onComplete])

  const handleEnd = useCallback(() => {
    setFading(true)
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // silent
    }
    setTimeout(() => {
      setVisible(false)
      setFading(false)
      onComplete()
    }, 1200)
  }, [onComplete])

  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    handleEnd()
  }, [handleEnd])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-1000 ${
        fading ? "opacity-0 blur-lg scale-105" : "opacity-100"
      }`}
      style={{ background: "#050510" }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        onTimeUpdate={handleTimeUpdate}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{ background: "rgba(0,240,255,0.1)" }}>
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00f0ff, #b44aff)",
            boxShadow: "0 0 10px rgba(0,240,255,0.5)",
          }}
        />
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-sans transition-all duration-300 hover:scale-105"
        style={{
          background: "rgba(15, 15, 42, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 240, 255, 0.2)",
          color: "rgba(224, 224, 255, 0.8)",
        }}
        aria-label="Skip intro video"
      >
        <span>Skip</span>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
