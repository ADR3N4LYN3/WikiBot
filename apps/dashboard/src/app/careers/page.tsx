import { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Badge } from '@/components/ui/Badge';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: 'Careers - WikiBot',
  description: 'Join the WikiBot team and help Discord communities organize their knowledge.',
};

const benefits = [
  {
    icon: Zap,
    title: 'Remote First',
    description: 'Work from anywhere in the world. We\'re a fully distributed team.',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance and wellness benefits.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work with passionate people who love what they do.',
  },
];

const openPositions = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    id: 3,
    title: 'Community Manager',
    department: 'Community',
    location: 'Remote',
    type: 'Full-time',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="premium" glow className="mb-6">
              We&apos;re Hiring
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Join the <GradientText>WikiBot</GradientText> Team
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the best knowledge management tool for Discord communities.
              We&apos;re looking for passionate people who want to make a difference.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Why Work With <GradientText>Us</GradientText>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <GlassCard key={benefit.title} className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Open <GradientText>Positions</GradientText>
            </h2>

            <div className="space-y-4">
              {openPositions.map((position) => (
                <Link key={position.id} href={`/careers/${position.id}`}>
                  <GlassCard className="p-6 group cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {position.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>

            {openPositions.length === 0 && (
              <GlassCard className="p-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No open positions</h3>
                <p className="text-muted-foreground">
                  We don&apos;t have any open positions right now, but check back soon!
                </p>
              </GlassCard>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Don&apos;t see a role for you?
            </h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re always looking for talented people. Send us your resume!
            </p>
            <a href="mailto:careers@wikibot-app.xyz">
              <GradientButton size="lg">
                Get in Touch
              </GradientButton>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
