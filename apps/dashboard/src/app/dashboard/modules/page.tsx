'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  BarChart3,
  Globe,
  Sparkles,
  Shield,
  Zap,
  LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { settingsApi } from '@/lib/api';
import { GradientText } from '@/components/ui/GradientText';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ModuleCard } from '@/components/ModuleCard';

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  isPremium?: boolean;
  isCore?: boolean;
  settingsKey: string;
  defaultEnabled: boolean;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'wiki-articles',
    name: 'Wiki Articles',
    description: 'Create and manage knowledge base articles for your community',
    icon: BookOpen,
    isCore: true,
    settingsKey: 'articlesEnabled',
    defaultEnabled: true,
  },
  {
    id: 'ai-search',
    name: 'AI-Powered Search',
    description: 'Semantic search with intelligent answers using RAG technology',
    icon: Sparkles,
    isPremium: true,
    settingsKey: 'aiSearchEnabled',
    defaultEnabled: false,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Track article views, searches, and community engagement',
    icon: BarChart3,
    settingsKey: 'analyticsEnabled',
    defaultEnabled: true,
  },
  {
    id: 'public-wiki',
    name: 'Public Web View',
    description: 'Allow anyone to read your wiki articles on the web',
    icon: Globe,
    settingsKey: 'publicWebview',
    defaultEnabled: false,
  },
  {
    id: 'search-logs',
    name: 'Search Logging',
    description: 'Log and analyze search queries for content optimization',
    icon: Search,
    settingsKey: 'searchLoggingEnabled',
    defaultEnabled: true,
  },
  {
    id: 'moderation',
    name: 'Content Moderation',
    description: 'Automatic content filtering and moderation tools',
    icon: Shield,
    isPremium: true,
    settingsKey: 'moderationEnabled',
    defaultEnabled: false,
  },
  {
    id: 'fast-indexing',
    name: 'Fast Indexing',
    description: 'Priority indexing for faster search updates',
    icon: Zap,
    isPremium: true,
    settingsKey: 'fastIndexingEnabled',
    defaultEnabled: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ModulesPage() {
  const { data: settings, mutate } = useSWR('settings', () =>
    settingsApi.get().then((res) => res.data)
  );
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    const module = MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    // Check if premium feature without premium subscription
    if (module.isPremium && enabled && settings?.premiumTier === 'free') {
      toast.error('Upgrade to Premium to enable this feature');
      return;
    }

    setUpdating(moduleId);
    try {
      await settingsApi.update({
        [module.settingsKey]: enabled,
      });
      await mutate();
      toast.success(`${module.name} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update module settings');
      console.error('Error updating module:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getModuleStatus = (module: ModuleConfig): string => {
    if (module.isCore) return 'Always enabled';
    if (module.isPremium && settings?.premiumTier === 'free') {
      return 'Requires Premium';
    }
    return settings?.[module.settingsKey] ? 'Active' : 'Inactive';
  };

  const isModuleEnabled = (module: ModuleConfig): boolean => {
    if (module.isCore) return true;
    return settings?.[module.settingsKey] ?? module.defaultEnabled;
  };

  const isModuleDisabled = (module: ModuleConfig): boolean => {
    return !!(module.isPremium && settings?.premiumTier === 'free');
  };

  const enabledCount = MODULES.filter((m) => isModuleEnabled(m)).length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">
          <GradientText>Modules</GradientText>
        </h1>
        <p className="text-muted-foreground mt-1">
          Enable or disable features for your wiki
        </p>
      </motion.div>

      {/* Stats Card */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">
                  {enabledCount} modules active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">
                  {MODULES.length - enabledCount} disabled
                </span>
              </div>
            </div>
            <Badge variant={settings?.premiumTier === 'free' ? 'default' : 'premium'}>
              {settings?.premiumTier === 'free' ? 'Free Plan' : 'Premium'}
            </Badge>
          </div>
        </GlassCard>
      </motion.div>

      {/* Modules Grid */}
      <motion.div className="grid gap-4" variants={containerVariants}>
        {MODULES.map((module) => (
          <motion.div key={module.id} variants={itemVariants}>
            <ModuleCard
              id={module.id}
              name={module.name}
              description={module.description}
              icon={module.icon}
              enabled={isModuleEnabled(module)}
              isPremium={module.isPremium}
              isCore={module.isCore}
              status={getModuleStatus(module)}
              onToggle={handleToggle}
              disabled={updating === module.id || isModuleDisabled(module)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Premium CTA */}
      {settings?.premiumTier === 'free' && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Unlock Premium Modules</h3>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered search, content moderation, and more with Premium
                </p>
              </div>
              <a
                href="/dashboard/settings/billing"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade Now
              </a>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
