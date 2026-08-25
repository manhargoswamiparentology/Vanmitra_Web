import Hero from '@/components/landing/Hero'
import WhyEarthNeeds from '@/components/landing/WhyEarthNeeds'
import TrustStrip from '@/components/landing/TrustStrip'
import OccasionGrid from '@/components/landing/OccasionGrid'
import HowItWorks from '@/components/landing/HowItWorks'
import SpeciesSection from '@/components/landing/SpeciesSection'
import FarmStory from '@/components/landing/FarmStory'
import CertificateTeaser from '@/components/landing/CertificateTeaser'
import Testimonials from '@/components/landing/Testimonials'
import JournalTeaser from '@/components/landing/JournalTeaser'
import FAQ from '@/components/landing/FAQ'
import ClosingCTA from '@/components/landing/ClosingCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyEarthNeeds />
      <TrustStrip />
      <OccasionGrid />
      <HowItWorks />
      <SpeciesSection />
      <FarmStory />
      <CertificateTeaser />
      <Testimonials />
      <JournalTeaser />
      <FAQ />
      <ClosingCTA />
    </>
  )
}
