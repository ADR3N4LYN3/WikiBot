import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AutocompleteInteraction,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

// Cache for categories autocomplete
const categoryCache = new Map<string, { data: Array<{ slug: string; name: string; emoji?: string }>; timestamp: number }>();
const CACHE_TTL = 60000;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-list')
    .setDescription('List articles in a category')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Category to list articles from (leave empty for all)')
        .setRequired(false)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const serverId = interaction.guildId;
    if (!serverId) return;

    const focusedValue = interaction.options.getFocused().toLowerCase();
    const cacheKey = `categories-${serverId}`;

    try {
      const cached = categoryCache.get(cacheKey);
      let categories: Array<{ slug: string; name: string; emoji?: string }>;

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        categories = cached.data;
      } else {
        const response = await apiClient.get('/api/v1/categories', {
          headers: { 'X-Server-Id': serverId },
        });

        categories = (response.data || []).map((c: { slug: string; name: string; emoji?: string }) => ({
          slug: c.slug,
          name: c.name,
          emoji: c.emoji,
        }));

        categoryCache.set(cacheKey, { data: categories, timestamp: Date.now() });
      }

      const filtered = categories
        .filter(c =>
          c.slug.toLowerCase().includes(focusedValue) ||
          c.name.toLowerCase().includes(focusedValue)
        )
        .slice(0, 25);

      await interaction.respond(
        filtered.map(c => ({
          name: `${c.emoji || '📁'} ${c.name}`.substring(0, 100),
          value: c.slug,
        }))
      );
    } catch (error) {
      console.error('Category autocomplete error:', error);
      await interaction.respond([]);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const categorySlug = interaction.options.getString('category');
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    try {
      // Get articles, optionally filtered by category
      const params: Record<string, string | number> = { limit: 25 };
      if (categorySlug) {
        params.categorySlug = categorySlug;
      }

      const response = await apiClient.get('/api/v1/articles', {
        params,
        headers: { 'X-Server-Id': serverId },
      });

      const { articles, total } = response.data;

      if (!articles || articles.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(DISCORD_COLORS.YELLOW)
          .setTitle('📚 No Articles Found')
          .setDescription(
            categorySlug
              ? `No articles found in category "${categorySlug}"`
              : 'No articles have been created yet. Use `/wiki-create` to add one!'
          );

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Get category info if filtering
      let categoryName = 'All Categories';
      let categoryEmoji = '📚';

      if (categorySlug && articles[0]?.category) {
        categoryName = articles[0].category.name;
        categoryEmoji = articles[0].category.emoji || '📁';
      }

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle(`${categoryEmoji} ${categoryName}`)
        .setDescription(`Found ${total} article(s)${total > 25 ? ' (showing first 25)' : ''}`);

      // Group articles and display
      const articleList = articles
        .slice(0, 25)
        .map((article: { title: string; slug: string; views?: number; category?: { emoji?: string } }, index: number) => {
          const emoji = article.category?.emoji || '📄';
          const views = article.views ?? 0;
          return `${index + 1}. ${emoji} **${article.title}**\n   \`/wiki-view ${article.slug}\` • ${views} views`;
        })
        .join('\n\n');

      embed.addFields({
        name: 'Articles',
        value: articleList || 'No articles',
      });

      embed.setFooter({
        text: 'Use /wiki-view [slug] to read an article',
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('List articles error:', error);
      const errorMessage = extractApiErrorMessage(error, 'An error occurred while listing articles.');
      await interaction.editReply({ embeds: [createErrorEmbed('Failed to List Articles', errorMessage)] });
    }
  },
};

export default command;
