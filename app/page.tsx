"use client"
import { useState, useEffect } from "react"
import { HeroSection } from "@/components/afrodebab/hero-section"
import { OurServiceSection } from "@/components/afrodebab/ourservice-section"
import { PortfolioSection } from "@/components/afrodebab/products-section"
import { TestimonialsSection } from "@/components/afrodebab/techstack-section"
import { TeamSection } from "@/components/afrodebab/team-section"
import { Footer } from "@/components/afrodebab/footer"
import Image from "next/image"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "system")
    root.classList.add("dark")
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        const headerOffset = 120
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  const navLinks = [
    { id: "about", label: "About" },
    { id: "services", label: "Our Service" },
    { id: "products", label: "Products" },
    { id: "team", label: "Team" },
  ]

  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Subtle gradient background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(74, 148, 115, 0.08), transparent 60%)",
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/90 md:flex backdrop-blur-md border border-border/50 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
        } py-2`}
      >
        <a
          className={`z-50 flex items-center justify-center gap-3 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
          href="#"
        >
          <Image
            src="/afrodebab-logo.png"
            alt="AfroDebab"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-semibold text-foreground tracking-tight">AfroDebab</span>
        </a>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => handleNavClick(link.id)}
            >
              <span className="relative z-20">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavClick("contact")}
            className="rounded-full font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-primary text-primary-foreground shadow-lg px-5 py-2 text-sm"
          >
            Contact Us
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-lg md:hidden px-4 py-3">
        <a className="flex items-center justify-center gap-2" href="#">
          <Image
            src="/afrodebab-logo.png"
            alt="AfroDebab"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold text-foreground text-sm">AfroDebab</span>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 border border-border/50 transition-colors hover:bg-muted"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-border/50 pt-4 mt-4">
                <button
                  onClick={() => handleNavClick("contact")}
                  className="w-full px-4 py-3 text-lg font-medium text-center bg-primary text-primary-foreground rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Contact Us
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        
        <div id="services">
          <OurServiceSection />
        </div>
        
        <div id="products">
          <PortfolioSection />
        </div>
        
        <div>
          <TestimonialsSection />
        </div>
        
        <div id="team">
          <TeamSection />
        </div>
        
        <div id="contact">
          <Footer />
        </div>
      </main>
    </div>
  )
}
