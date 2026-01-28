import { Metadata } from 'next';
import { Mail, MessageSquare, Clock } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact - WikiBot',
  description: 'Get in touch with the WikiBot team. We\'re here to help.',
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us an email anytime',
    value: 'support@wikibot-app.xyz',
    href: 'mailto:support@wikibot-app.xyz',
  },
  {
    icon: MessageSquare,
    title: 'Discord',
    description: 'Join our community server',
    value: 'discord.gg/wikibot',
    href: 'https://discord.gg/wikibot',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 hero-pattern opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Get in <GradientText>Touch</GradientText>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hi?
              We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {contactMethods.map((method) => (
                <a key={method.title} href={method.href} target="_blank" rel="noopener noreferrer">
                  <GlassCard className="p-6 h-full group cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    <p className="text-primary font-medium">{method.value}</p>
                  </GlassCard>
                </a>
              ))}
            </div>

            {/* Contact Form */}
            <GlassCard className="p-6 sm:p-10">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-muted/50 border border-border',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'transition-all duration-300'
                      )}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-muted/50 border border-border',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'transition-all duration-300'
                      )}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-muted/50 border border-border',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                      'transition-all duration-300'
                    )}
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-muted/50 border border-border',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                      'transition-all duration-300',
                      'resize-none'
                    )}
                    placeholder="Tell us more..."
                  />
                </div>

                <GradientButton type="submit" size="lg" className="w-full sm:w-auto">
                  Send Message
                </GradientButton>
              </form>
            </GlassCard>
          </div>
        </section>

        {/* Response Time */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Response Time</h2>
            <p className="text-muted-foreground">
              We typically respond within 24-48 hours during business days.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
