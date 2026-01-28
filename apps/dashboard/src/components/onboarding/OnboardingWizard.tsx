'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

import { cn } from '@/lib/utils';
import { categoriesApi, articlesApi } from '@/lib/api';
import { WelcomeStep } from './steps/WelcomeStep';
import { CategoryStep } from './steps/CategoryStep';
import { ArticleStep } from './steps/ArticleStep';
import { CompleteStep } from './steps/CompleteStep';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

type Step = 'welcome' | 'category' | 'article' | 'complete';

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [categoryData, setCategoryData] = useState<{ name: string; emoji: string } | null>(null);
  const [articleTitle, setArticleTitle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryNext = async (category: { name: string; emoji: string }) => {
    setIsSubmitting(true);
    try {
      await categoriesApi.create({
        name: category.name,
        emoji: category.emoji,
      });
      setCategoryData(category);
      setStep('article');
      toast.success(`Category "${category.name}" created!`);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArticleNext = async (article: { title: string; content: string } | null) => {
    if (article) {
      setIsSubmitting(true);
      try {
        await articlesApi.create({
          title: article.title,
          content: article.content,
        });
        setArticleTitle(article.title);
        toast.success(`Article "${article.title}" created!`);
      } catch (error) {
        console.error('Error creating article:', error);
        toast.error('Failed to create article');
      } finally {
        setIsSubmitting(false);
      }
    }
    setStep('complete');
  };

  const stepIndex = {
    welcome: 0,
    category: 1,
    article: 2,
    complete: 3,
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Content */}
      <motion.div
        className={cn(
          'relative w-full max-w-xl mx-auto',
          'bg-card/80 backdrop-blur-xl',
          'border border-border/50 rounded-2xl',
          'shadow-2xl shadow-black/20',
          'p-8'
        )}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Skip button */}
        {step !== 'complete' && (
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Progress */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'w-16 h-1 rounded-full transition-colors duration-300',
                    stepIndex[step] >= s ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Step {stepIndex[step]} of 2
            </p>
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 'welcome' && (
              <WelcomeStep onNext={() => setStep('category')} />
            )}
            {step === 'category' && (
              <CategoryStep
                onNext={handleCategoryNext}
                onBack={() => setStep('welcome')}
              />
            )}
            {step === 'article' && categoryData && (
              <ArticleStep
                categoryName={categoryData.name}
                onNext={handleArticleNext}
                onBack={() => setStep('category')}
              />
            )}
            {step === 'complete' && categoryData && (
              <CompleteStep
                categoryName={categoryData.name}
                articleTitle={articleTitle}
                onComplete={onComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Loading overlay */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
