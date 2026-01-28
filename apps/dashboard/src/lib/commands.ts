import {
  Plus,
  FolderPlus,
  Settings,
  Search,
  Home,
  BookOpen,
  BarChart3,
  ToggleRight,
  FileText,
  HelpCircle,
  Keyboard,
  LucideIcon,
} from 'lucide-react';

export interface Command {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  shortcut?: string;
  section: 'quick' | 'navigation' | 'help';
  action: () => void | Promise<void>;
}

export interface CommandSection {
  id: string;
  title: string;
  commands: Command[];
}

export function createCommands(
  navigate: (path: string) => void,
  actions: {
    openSearch?: () => void;
    openCategoryModal?: () => void;
  }
): CommandSection[] {
  return [
    {
      id: 'quick',
      title: 'Quick Actions',
      commands: [
        {
          id: 'new-article',
          name: 'New Article',
          description: 'Create a new wiki article',
          icon: Plus,
          shortcut: 'Ctrl+N',
          section: 'quick',
          action: () => navigate('/dashboard/articles/new'),
        },
        {
          id: 'new-category',
          name: 'New Category',
          description: 'Create a new category',
          icon: FolderPlus,
          shortcut: 'Ctrl+Shift+N',
          section: 'quick',
          action: () => actions.openCategoryModal?.(),
        },
        {
          id: 'search',
          name: 'Search Articles',
          description: 'Find articles quickly',
          icon: Search,
          shortcut: '/',
          section: 'quick',
          action: () => actions.openSearch?.(),
        },
      ],
    },
    {
      id: 'navigation',
      title: 'Navigation',
      commands: [
        {
          id: 'nav-overview',
          name: 'Go to Overview',
          description: 'Dashboard overview',
          icon: Home,
          section: 'navigation',
          action: () => navigate('/dashboard'),
        },
        {
          id: 'nav-articles',
          name: 'Go to Articles',
          description: 'Manage wiki articles',
          icon: BookOpen,
          section: 'navigation',
          action: () => navigate('/dashboard/articles'),
        },
        {
          id: 'nav-categories',
          name: 'Go to Categories',
          description: 'Manage categories',
          icon: FolderPlus,
          section: 'navigation',
          action: () => navigate('/dashboard/categories'),
        },
        {
          id: 'nav-analytics',
          name: 'Go to Analytics',
          description: 'View statistics',
          icon: BarChart3,
          section: 'navigation',
          action: () => navigate('/dashboard/analytics'),
        },
        {
          id: 'nav-modules',
          name: 'Go to Modules',
          description: 'Configure features',
          icon: ToggleRight,
          section: 'navigation',
          action: () => navigate('/dashboard/modules'),
        },
        {
          id: 'nav-settings',
          name: 'Go to Settings',
          description: 'Configure your wiki',
          icon: Settings,
          shortcut: 'Ctrl+,',
          section: 'navigation',
          action: () => navigate('/dashboard/settings'),
        },
      ],
    },
    {
      id: 'help',
      title: 'Help',
      commands: [
        {
          id: 'help-docs',
          name: 'Documentation',
          description: 'Read the docs',
          icon: FileText,
          section: 'help',
          action: () => window.open('https://docs.wikibot.app', '_blank'),
        },
        {
          id: 'help-shortcuts',
          name: 'Keyboard Shortcuts',
          description: 'View all shortcuts',
          icon: Keyboard,
          section: 'help',
          action: () => {
            // Could open a shortcuts modal
          },
        },
        {
          id: 'help-support',
          name: 'Get Support',
          description: 'Contact our team',
          icon: HelpCircle,
          section: 'help',
          action: () => navigate('/contact'),
        },
      ],
    },
  ];
}

export function filterCommands(
  sections: CommandSection[],
  query: string
): CommandSection[] {
  if (!query.trim()) {
    return sections;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return sections
    .map((section) => ({
      ...section,
      commands: section.commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(normalizedQuery) ||
          cmd.description.toLowerCase().includes(normalizedQuery)
      ),
    }))
    .filter((section) => section.commands.length > 0);
}
