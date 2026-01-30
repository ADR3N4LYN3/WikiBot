import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

interface AnalyticsOverview {
  totalArticles: number;
  totalSearches: number;
  totalViews: number;
  totalCategories: number;
  articlesThisMonth: number;
  searchesThisMonth: number;
}

interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  helpful: number;
  categoryName?: string;
}

interface TopSearch {
  query: string;
  count: number;
  avgResultCount: number;
  lastSearched: string;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-analytics')
    .setDescription('View wiki analytics and statistics')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('overview')
        .setDescription('Get an overview of wiki statistics')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('top-articles')
        .setDescription('See the most viewed articles')
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('Number of articles to show (default: 10)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(25)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('top-searches')
        .setDescription('See the most popular search queries')
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('Number of searches to show (default: 10)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(25)
        )
    ),

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
      case 'overview':
        await handleOverview(interaction, serverId);
        break;
      case 'top-articles':
        await handleTopArticles(interaction, serverId);
        break;
      case 'top-searches':
        await handleTopSearches(interaction, serverId);
        break;
    }
  },
};

async function handleOverview(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  try {
    const response = await apiClient.get('/api/v1/analytics/overview', {
      headers: { 'X-Server-Id': serverId },
    });

    const stats: AnalyticsOverview = response.data;

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('📊 Wiki Analytics Overview')
      .addFields(
        {
          name: '📚 Articles',
          value: `**${stats.totalArticles}** total\n+${stats.articlesThisMonth} this month`,
          inline: true,
        },
        {
          name: '🔍 Searches',
          value: `**${stats.totalSearches}** total\n+${stats.searchesThisMonth} this month`,
          inline: true,
        },
        {
          name: '👁️ Views',
          value: `**${stats.totalViews}** total`,
          inline: true,
        },
        {
          name: '📁 Categories',
          value: `**${stats.totalCategories}** total`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Wiki Analytics' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Analytics overview error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch analytics');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

async function handleTopArticles(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const limit = interaction.options.getInteger('limit') || 10;

  try {
    const response = await apiClient.get('/api/v1/analytics/top-articles', {
      headers: { 'X-Server-Id': serverId },
      params: { limit },
    });

    const articles: TopArticle[] = response.data || [];

    if (articles.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('📈 Top Articles')
        .setDescription('No articles found yet. Create some articles to see statistics!');

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const lines = articles.map((article, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const category = article.categoryName ? ` • ${article.categoryName}` : '';
      const helpfulPercent =
        article.views > 0 ? Math.round((article.helpful / article.views) * 100) : 0;
      return `${medal} **${article.title}**${category}\n   └ 👁️ ${article.views} views • 👍 ${helpfulPercent}% helpful`;
    });

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('📈 Top Articles by Views')
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: `Showing top ${articles.length} articles` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Top articles error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch top articles');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

async function handleTopSearches(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const limit = interaction.options.getInteger('limit') || 10;

  try {
    const response = await apiClient.get('/api/v1/analytics/top-searches', {
      headers: { 'X-Server-Id': serverId },
      params: { limit },
    });

    const searches: TopSearch[] = response.data || [];

    if (searches.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('🔍 Top Searches')
        .setDescription('No searches recorded yet.');

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const lines = searches.map((search, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const avgResults = Math.round(search.avgResultCount);
      return `${medal} **"${search.query}"**\n   └ ${search.count} searches • ~${avgResults} results`;
    });

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('🔍 Top Searches')
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: `Showing top ${searches.length} search queries` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Top searches error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch top searches');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

export default command;
