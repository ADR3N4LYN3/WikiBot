'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';

const faqs = [
  {
    question: 'Is WikiBot free to use?',
    answer:
      'Yes! WikiBot has a free tier that includes up to 50 articles, 1 Discord server, and basic analytics. For larger communities, we offer Premium plans with unlimited articles and advanced features.',
  },
  {
    question: 'How do I add WikiBot to my server?',
    answer:
      'Simply click the "Add to Discord" button on our homepage. You\'ll be redirected to Discord where you can select which server to add the bot to. Make sure you have the "Manage Server" permission.',
  },
  {
    question: 'Can I customize the bot commands?',
    answer:
      'WikiBot uses Discord\'s slash commands which are standardized. However, you can customize article categories, permissions, and how content is displayed through the dashboard.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use industry-standard encryption and security practices. Your articles and data are stored securely and we never share your information with third parties. See our Privacy Policy for details.',
  },
  {
    question: 'Can multiple people manage the wiki?',
    answer:
      'Yes! You can configure role-based permissions to allow specific Discord roles to create, edit, or delete articles. This is great for teams and moderation.',
  },
  {
    question: 'Does WikiBot support multiple languages?',
    answer:
      'WikiBot supports content in any language. The bot interface is currently in English, but your articles can be written in any language your community uses.',
  },
  {
    question: 'How do I migrate from another wiki solution?',
    answer:
      'We offer import tools in the dashboard that can help you migrate content from common formats. For large migrations, contact our support team for assistance.',
  },
  {
    question: 'What happens if I cancel my Premium subscription?',
    answer:
      'If you cancel, your account will revert to the free tier at the end of your billing period. Your articles will be preserved, but you may need to reduce your article count to stay within free tier limits.',
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-4 sm:p-6 text-left',
          'hover:bg-muted/30 transition-colors duration-200'
        )}
      >
        <span className="font-medium text-sm sm:text-base pr-4">{faq.question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-muted-foreground">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Frequently Asked
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <GradientText>Questions</GradientText>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need to know about WikiBot.
            Can&apos;t find what you&apos;re looking for? Contact us!
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
