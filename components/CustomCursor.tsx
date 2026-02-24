'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useMotionValue(-100)
  const ringY = useMotionValue(-100)

  const springConfig = { damping: 28, stiffness: 300, mass: 0.5 }
  const ringSpringX = useSpring(ringX, springConfig)
  const ringSpringY = useSpring(ringY, springConfig)

  const isHovering = useRef(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
      ringX.set(e.clientX)
      ringY.set(e.clientY)
    }

    const handleMouseEnter = () => { isHovering.current = true }
    const handleMouseLeave = () => { isHovering.current = false }

    window.addEventListener('mousemove', moveCursor)

    const interactables = document.querySelectorAll('a, button, [data-cursor]')
    interactables.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [dotX, dotY, ringX, ringY])

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringSpringX, y: ringSpringY }}
      />
    </>
  )
}
