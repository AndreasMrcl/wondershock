'use client'

import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import WhatsOnSection from '@/components/WhatsOnSection'
import CalendarSection from '@/components/CalendarSection'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'

export default function Home() {
  useEffect(() => {
    // Prevent flash of unstyled content
    document.body.style.visibility = 'visible'
  }, [])

  return (
    <main className="relative overflow-x-hidden">
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <WhatsOnSection />
      <CalendarSection />
      <Footer />
    </main>
  )
}
