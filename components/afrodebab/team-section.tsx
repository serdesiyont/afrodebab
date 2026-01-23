"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Linkedin } from "lucide-react"

const team = [
  {
    name: "Rekik H Biyadgilign",
    role: "Team Member",
    bio: "Key contributor to AfroDebab's mission and vision.",
    img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "Amanuel Lawro",
    role: "Senior Developer",
    bio: "Experienced Java and JavaScript Developer with expertise in designing and maintaining web applications and systems.",
    img: "/amanuel-lawro.jpeg",
    linkedin: "https://www.linkedin.com/in/amanuel-lawro/",
  },
  {
    name: "Getachew Bezu",
    role: "Legal Advisor",
    bio: "An academic and lawyer interested in international economic law, and law and development.",
    img: "/getachew-bezu.jpeg",
    linkedin: "https://www.linkedin.com/in/getachew-bezu-839773137/",
  },
  {
    name: "Abel Abebe",
    role: "Software Engineer",
    bio: "Software Engineer with over 4 years of experience specializing in Flutter mobile development and frontend technologies.",
    img: "/abel-abebe.jpeg",
    linkedin: "https://www.linkedin.com/in/abel-abebe/",
  },
]

export function TeamSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div ref={ref} className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-6">
              <span className="text-sm text-muted-foreground">Our Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Leadership That{" "}
              <span className="text-primary">Inspires</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the visionaries behind AfroDebab, committed to building a better 
              future for African technology and commerce.
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group text-center"
              >
                {/* Profile Image */}
                <div className="relative mb-6 mx-auto w-40 h-40">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300" />
                  <img
                    src={member.img || "/placeholder.svg"}
                    alt={member.name}
                    className="relative w-full h-full rounded-full object-cover border-4 border-card shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-primary mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>

                {/* Social Links */}
                {member.linkedin && (
                  <div className="flex justify-center">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
