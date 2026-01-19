"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Marquee } from "@/components/magicui/marquee"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Amara Okonkwo",
    role: "Diaspora User, UK",
    body: "goGerami has transformed how I send gifts to my family back home. The process is seamless, and knowing my loved ones receive quality items gives me peace of mind.",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Kwame Asante",
    role: "Local Vendor Partner",
    body: "Partnering with AfroDebab has opened new markets for my business. The platform is reliable, and the support team truly understands African commerce.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Fatima Ibrahim",
    role: "Tech Partner",
    body: "The technical infrastructure AfroDebab has built is impressive. Their commitment to security and user experience sets a new standard for African tech companies.",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "David Mensah",
    role: "Investor",
    body: "AfroDebab represents the future of African technology. Their vision of connecting the diaspora with home markets is both culturally significant and commercially viable.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Chioma Eze",
    role: "Diaspora User, USA",
    body: "I've tried many platforms to send gifts home, but none compare to the reliability and cultural understanding that AfroDebab brings. They truly get us.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Yohannes Tekle",
    role: "Business Partner",
    body: "Working with AfroDebab has been a partnership built on trust. Their professionalism and commitment to excellence make them ideal collaborators.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
]

const firstColumn = testimonials.slice(0, 2)
const secondColumn = testimonials.slice(2, 4)
const thirdColumn = testimonials.slice(4, 6)

function TestimonialCard({
  img,
  name,
  role,
  body,
}: {
  img: string
  name: string
  role: string
  body: string
}) {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-sm">
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
      
      <p className="text-foreground/90 leading-relaxed mb-6">{body}</p>

      <div className="flex items-center gap-3">
        <img
          src={img || "/placeholder.svg"}
          alt={name}
          className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
        />
        <div>
          <div className="font-semibold text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground">{role}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={ref} className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <span className="text-sm text-muted-foreground">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Trusted by Our{" "}
              <span className="text-primary">Community</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from partners, vendors, and users who have experienced the AfroDebab difference.
            </p>
          </motion.div>

          {/* Testimonials Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex max-h-[600px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]"
          >
            <div className="hidden lg:block">
              <Marquee pauseOnHover vertical className="[--duration:25s]">
                {firstColumn.map((testimonial) => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </Marquee>
            </div>

            <div>
              <Marquee reverse pauseOnHover vertical className="[--duration:20s]">
                {secondColumn.map((testimonial) => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </Marquee>
            </div>

            <div className="hidden md:block">
              <Marquee pauseOnHover vertical className="[--duration:30s]">
                {thirdColumn.map((testimonial) => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </Marquee>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
