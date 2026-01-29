'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GradientText } from '../ui/GradientText';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  server: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "WikiBot transformed how we share knowledge in our gaming community. The search is incredibly fast and the dashboard is beautiful.",
    author: "Sarah K.",
    role: "Community Manager",
    server: "Apex Legends FR",
    avatar: "SK",
    rating: 5,
  },
  {
    id: 2,
    content: "Finally a wiki solution that works natively in Discord. Our support team's response time dropped by 60% since we started using WikiBot.",
    author: "Marcus T.",
    role: "Server Admin",
    server: "Tech Support Hub",
    avatar: "MT",
    rating: 5,
  },
  {
    id: 3,
    content: "The AI-powered search is a game changer. Members find answers instantly without waiting for moderators. Highly recommended!",
    author: "Elena R.",
    role: "Founder",
    server: "Creative Writers Guild",
    avatar: "ER",
    rating: 5,
  },
  {
    id: 4,
    content: "Clean interface, powerful features, and excellent documentation. WikiBot is exactly what our developer community needed.",
    author: "James L.",
    role: "Lead Developer",
    server: "Open Source Collective",
    avatar: "JL",
    rating: 5,
  },
  {
    id: 5,
    content: "We migrated from Notion and never looked back. The Discord integration is seamless and our members love it.",
    author: "Amy W.",
    role: "Moderator",
    server: "Study Together",
    avatar: "AW",
    rating: 5,
  },
  {
    id: 6,
    content: "The analytics dashboard helps us understand what our community needs. We can see which articles are popular and improve our content.",
    author: "David M.",
    role: "Content Lead",
    server: "Crypto Academy",
    avatar: "DM",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative p-6 rounded-2xl bg-card/50 border backdrop-blur-sm hover:border-primary/30 transition-colors"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

      <StarRating rating={testimonial.rating} />

      <p className="mt-4 text-muted-foreground leading-relaxed">
        "{testimonial.content}"
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-medium">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role} • {testimonial.server}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Loved by <GradientText>Communities</GradientText>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of Discord servers already using WikiBot to share knowledge and support their members.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm">SOC 2 Type II</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm">Discord Verified</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
