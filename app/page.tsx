'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import IntroSection from '@/components/IntroSection'
import HeroSection from '@/components/HeroSection'
import WhatsOnSection from '@/components/WhatsOnSection'
import CalendarSection from '@/components/CalendarSection'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'
import SocialSidebar from '@/components/SocialSidebar'

export default function Home() {
  const [navbarVisible, setNavbarVisible] = useState(false)

  useEffect(() => {
    document.body.classList.add('custom-cursor')
    document.body.style.visibility = 'visible'
    return () => document.body.classList.remove('custom-cursor')
  }, [])

  return (
    <main className="relative overflow-x-hidden">
      <CustomCursor />
      <SocialSidebar />

      {/* Navbar — hidden during intro, shown after */}
      <div
        style={{
          opacity: navbarVisible ? 1 : 0,
          pointerEvents: navbarVisible ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
        }}
      >
        <Navbar />
      </div>

      {/* Intro: 3 cycling phrases, fullscreen, blocks navbar */}
      <IntroSection onNavbarVisible={setNavbarVisible} />

      {/* Hero: spotlight + welcome text moves center→left */}
      <HeroSection />

      <WhatsOnSection />
      <CalendarSection />
      <Footer />
    </main>
  )
}