import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Users, Target, Heart, ArrowRight } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'About - WikiBot',
  description: 'Learn more about WikiBot and our mission to help Discord communities organize their knowledge.',
};

const values = [
  {
    icon: Users,
    title: 'Community first',
    description: 'We build for Discord communities, listening to feedback and constantly improving.',
  },
  {
    icon: Target,
    title: 'Simplicity',
    description: 'Powerful features wrapped in an intuitive interface. No learning curve needed.',
  },
  {
    icon: Heart,
    title: 'Open & transparent',
    description: 'We believe in transparency. Our roadmap and changelog are always public.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl shadow-primary/25">
              <BookOpen className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              About <GradientText>WikiBot</GradientText>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              WikiBot was born from a simple idea: Discord communities deserve a better way
              to organize and share knowledge. No more pinned messages getting lost,
              no more answering the same questions over and over.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2026, we noticed that Discord communities were struggling with a common problem:
                  information was scattered across channels, FAQs were buried in pinned messages,
                  and moderators spent countless hours answering the same questions.
                </p>
                <p>
                  We built WikiBot to solve this. With simple slash commands, anyone can search
                  a community&apos;s knowledge base instantly. Moderators can create and organize
                  articles in a beautiful dashboard, and analytics help identify what information
                  members need most.
                </p>
                <p>
                  WikiBot is designed for Discord communities of all sizes, from gaming servers
                  to developer communities, helping them share knowledge effortlessly.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Our <GradientText>Values</GradientText>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value) => (
                <GlassCard key={value.title} className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Discord communities using WikiBot to organize their knowledge.
            </p>
            <Link href="/invite">
              <GradientButton size="lg" className="group">
                Add to Discord
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
