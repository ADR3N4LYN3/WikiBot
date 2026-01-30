'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Clock, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { GradientButton } from '@/components/ui/GradientButton';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { cn } from '@/lib/utils';

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

const categories = [
  { id: 'general', label: 'General Inquiry' },
  { id: 'support', label: 'Technical Support' },
  { id: 'billing', label: 'Billing & Subscriptions' },
  { id: 'partnership', label: 'Partnership' },
  { id: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            category,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      const result = await response.json();
      setTicketId(result.ticketId);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setCategory('general');
    setSubmitted(false);
    setTicketId('');
  };

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
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground mb-4">
                    Thank you for contacting us. We&apos;ll get back to you within 24-48 hours.
                  </p>
                  {ticketId && (
                    <p className="text-sm text-muted-foreground mb-6">
                      Your ticket ID: <span className="font-mono font-semibold">{ticketId}</span>
                    </p>
                  )}
                  <button
                    onClick={resetForm}
                    className="text-primary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(
                            'w-full px-4 py-3 rounded-xl',
                            'bg-muted/50 border border-border',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'transition-all duration-300'
                          )}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            'w-full px-4 py-3 rounded-xl',
                            'bg-muted/50 border border-border',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'transition-all duration-300'
                          )}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                          Category
                        </label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={cn(
                            'w-full px-4 py-3 rounded-xl',
                            'bg-muted/50 border border-border',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'transition-all duration-300'
                          )}
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={cn(
                            'w-full px-4 py-3 rounded-xl',
                            'bg-muted/50 border border-border',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                            'transition-all duration-300'
                          )}
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className={cn(
                          'w-full px-4 py-3 rounded-xl',
                          'bg-muted/50 border border-border',
                          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                          'transition-all duration-300',
                          'resize-none'
                        )}
                        placeholder="Tell us more... (minimum 20 characters)"
                        required
                        minLength={20}
                      />
                    </div>

                    <GradientButton
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send message'
                      )}
                    </GradientButton>
                  </form>
                </>
              )}
            </GlassCard>
          </div>
        </section>

        {/* Response Time */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Response time</h2>
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
