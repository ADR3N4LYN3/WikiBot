import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AutocompleteInteraction,
  PermissionFlagsBits,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  _count?: {
    articles: number;
  };
}

// Cache for autocomplete suggestions (TTL: 60s)
const autocompleteCache = new Map<string, { data: Category[]; timestamp: number }>();
const CACHE_TTL = 60000;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-category')
    .setDescription('Manage wiki categories')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Create a new category')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Category name')
            .setRequired(true)
            .setMaxLength(50)
        )
        .addStringOption((option) =>
          option
            .setName('slug')
            .setDescription('URL-friendly slug (auto-generated if not provided)')
            .setRequired(false)
            .setMaxLength(50)
        )
        .addStringOption((option) =>
          option
            .setName('description')
            .setDescription('Category description')
            .setRequired(false)
            .setMaxLength(200)
        )
        .addStringOption((option) =>
          option
            .setName('emoji')
            .setDescription('Category emoji (e.g., 📚)')
            .setRequired(false)
            .setMaxLength(10)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all categories')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete a category')
        .addStringOption((option) =>
          option
            .setName('slug')
            .setDescription('Category slug to delete')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const serverId = interaction.guildId;
    if (!serverId) return;

    const focusedValue = interaction.options.getFocused().toLowerCase();
    const cacheKey = `categories-${serverId}`;

    try {
      // Check cache
      const cached = autocompleteCache.get(cacheKey);
      let categories: Category[];

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        categories = cached.data;
      } else {
        // Fetch categories from API
        const response = await apiClient.get('/api/v1/categories', {
          headers: { 'X-Server-Id': serverId },
        });

        categories = response.data || [];
        autocompleteCache.set(cacheKey, { data: categories, timestamp: Date.now() });
      }

      // Filter and return suggestions
      const filtered = categories
        .filter(
          (c) =>
            c.slug.toLowerCase().includes(focusedValue) ||
            c.name.toLowerCase().includes(focusedValue)
        )
        .slice(0, 25);

      await interaction.respond(
        filtered.map((c) => ({
          name: `${c.emoji || '📁'} ${c.name} (${c.slug})`.substring(0, 100),
          value: c.slug,
        }))
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
      await interaction.respond([]);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.reply({
        embeds: [createErrorEmbed('Error', 'This command can only be used in a server!')],
        ephemeral: true,
      });
      return;
    }

    switch (subcommand) {
      case 'create':
        await handleCreate(interaction, serverId);
        break;
      case 'list':
        await handleList(interaction, serverId);
        break;
      case 'delete':
        await handleDelete(interaction, serverId);
        break;
    }
  },
};

async function handleCreate(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const name = interaction.options.getString('name', true);
  const slug = interaction.options.getString('slug') || generateSlug(name);
  const description = interaction.options.getString('description');
  const emoji = interaction.options.getString('emoji');

  try {
    const response = await apiClient.post(
      '/api/v1/categories',
      {
        name,
        slug,
        description: description || undefined,
        emoji: emoji || undefined,
      },
      {
        headers: { 'X-Server-Id': serverId },
      }
    );

    const category = response.data;

    // Invalidate cache
    autocompleteCache.delete(`categories-${serverId}`);

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.GREEN)
      .setTitle('✅ Category Created')
      .addFields(
        { name: 'Name', value: `${category.emoji || '📁'} ${category.name}`, inline: true },
        { name: 'Slug', value: category.slug, inline: true }
      );

    if (category.description) {
      embed.addFields({ name: 'Description', value: category.description });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Create category error:', error);

    const message = extractApiErrorMessage(error, 'Failed to create category');
    const is409 = axios.isAxiosError(error) && error.response?.status === 409;

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is409 ? 'Category Already Exists' : 'Error',
          is409 ? `A category with slug "${slug}" already exists.` : message
        ),
      ],
    });
  }
}

async function handleList(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  try {
    const response = await apiClient.get('/api/v1/categories', {
      headers: { 'X-Server-Id': serverId },
    });

    const categories: Category[] = response.data || [];

    if (categories.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('📁 Categories')
        .setDescription('No categories found. Use `/wiki-category create` to add one!');

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const categoryList = categories
      .map((c) => {
        const articleCount = c._count?.articles ?? 0;
        const emoji = c.emoji || '📁';
        const desc = c.description ? ` - ${c.description}` : '';
        return `${emoji} **${c.name}** (\`${c.slug}\`)${desc}\n   └ ${articleCount} article${articleCount !== 1 ? 's' : ''}`;
      })
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('📁 Categories')
      .setDescription(categoryList)
      .setFooter({ text: `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('List categories error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch categories');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

async function handleDelete(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const slug = interaction.options.getString('slug', true);

  try {
    await apiClient.delete(`/api/v1/categories/${slug}`, {
      headers: { 'X-Server-Id': serverId },
    });

    // Invalidate cache
    autocompleteCache.delete(`categories-${serverId}`);

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.GREEN)
      .setTitle('✅ Category Deleted')
      .setDescription(`Category \`${slug}\` has been deleted.`)
      .setFooter({ text: 'Articles in this category are now uncategorized.' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Delete category error:', error);

    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    const message = extractApiErrorMessage(error, 'Failed to delete category');

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is404 ? 'Category Not Found' : 'Error',
          is404 ? `No category found with slug "${slug}"` : message
        ),
      ],
    });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

export default command;
