import { Navbar } from "../components/Navbar"
import { Hero } from "../components/Hero"
import { HowItWorks } from "../components/HowItWorks"
import { Pricing } from "../components/Pricing"
import { ComparisonCalculator } from "../components/ComparisonCalculator"
import { Testimonials } from "../components/Testimonials"
import { FAQ } from "../components/FAQ"
import { Footer } from "../components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-vasta-bg text-vasta-text font-sans">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <section id="calculadora" className="bg-vasta-bg py-20 px-4">
          <div className="mx-auto max-w-7xl">
            <ComparisonCalculator />
          </div>
        </section>
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
