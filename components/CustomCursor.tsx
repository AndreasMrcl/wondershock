'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const [hovering, setHovering] = useState(false)

  const springConfig = { damping: 32, stiffness: 280, mass: 0.4 }
  const ringX = useSpring(mouseX, springConfig)
  const ringY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const onEnter = () => setHovering(true)
    const onLeave = () => setHovering(false)

    window.addEventListener('mousemove', moveCursor)

    // Watch for hover on all clickable elements — including dynamically added ones
    const attach = () => {
      document.querySelectorAll('a, button, [role="button"], [data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    attach()

    // Re-attach on DOM mutations (e.g. menu open)
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      observer.disconnect()
    }
  }, [mouseX, mouseY])

  return (
    <>
      {/* Global cursor:none for ALL elements including interactive */}
      <style>{`
        *, *::before, *::after,
        a, button, [role="button"], input, select, textarea, label, [tabindex] {
          cursor: none !important;
        }
      `}</style>

      {/* Dot — expands on hover over clickables */}
      <motion.div
        animate={{
          width: hovering ? 22 : 8,
          height: hovering ? 22 : 8,
          opacity: hovering ? 0.35 : 1,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderRadius: '50%',
          background: 'var(--ws-red)',
          pointerEvents: 'none',
          zIndex: 9999,
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      {/* Ring — stays same size always */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid rgba(236, 43, 37, 0.5)',
          pointerEvents: 'none',
          zIndex: 9998,
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  )
}