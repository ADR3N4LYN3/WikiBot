import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AutocompleteInteraction } from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';

// Cache for autocomplete suggestions (TTL: 60s)
const autocompleteCache = new Map<string, { data: Array<{ slug: string; title: string }>; timestamp: number }>();
const CACHE_TTL = 60000;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-view')
    .setDescription('View an article from the knowledge base')
    .addStringOption(option =>
      option
        .setName('slug')
        .setDescription('The slug of the article to view')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const serverId = interaction.guildId;
    if (!serverId) return;

    const focusedValue = interaction.options.getFocused().toLowerCase();
    const cacheKey = `${serverId}`;

    try {
      // Check cache
      const cached = autocompleteCache.get(cacheKey);
      let articles: Array<{ slug: string; title: string }>;

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        articles = cached.data;
      } else {
        // Fetch articles from API
        const response = await apiClient.get('/api/v1/articles', {
          params: { limit: 50 },
          headers: { 'X-Server-Id': serverId },
        });

        articles = (response.data.articles || []).map((a: { slug: string; title: string }) => ({
          slug: a.slug,
          title: a.title,
        }));

        autocompleteCache.set(cacheKey, { data: articles, timestamp: Date.now() });
      }

      // Filter and return suggestions
      const filtered = articles
        .filter(a =>
          a.slug.toLowerCase().includes(focusedValue) ||
          a.title.toLowerCase().includes(focusedValue)
        )
        .slice(0, 25);

      await interaction.respond(
        filtered.map(a => ({
          name: `${a.title} (${a.slug})`.substring(0, 100),
          value: a.slug,
        }))
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
      await interaction.respond([]);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const slug = interaction.options.getString('slug', true);
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    try {
      // Get article via API
      const response = await apiClient.get(`/api/v1/articles/${slug}`, {
        headers: {
          'X-Server-Id': serverId,
        },
      });

      const article = response.data;

      // Safely extract article data with defaults
      const content = article.content?.substring(0, 4000) || 'No content available';
      const authorName = article.author?.username || 'Unknown';
      const views = article.views ?? 0;
      const helpful = article.helpful ?? 0;
      const notHelpful = article.notHelpful ?? 0;
      const totalVotes = helpful + notHelpful;
      const updatedAt = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'Unknown';

      // Create embed
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle(`${article.category?.emoji || '📄'} ${article.title || 'Untitled'}`)
        .setDescription(content)
        .addFields(
          {
            name: '👤 Author',
            value: authorName,
            inline: true,
          },
          {
            name: '👀 Views',
            value: views.toString(),
            inline: true,
          },
          {
            name: '👍 Helpful',
            value: totalVotes > 0 ? `${helpful} / ${totalVotes}` : 'No votes yet',
            inline: true,
          }
        )
        .setFooter({
          text: `Last updated ${updatedAt}`,
        });

      if (article.category) {
        embed.addFields({
          name: '📂 Category',
          value: article.category.name,
          inline: true,
        });
      }

      // Add helpful/not helpful buttons
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`helpful-${article.id}`)
          .setLabel('Helpful')
          .setStyle(ButtonStyle.Success)
          .setEmoji('👍'),
        new ButtonBuilder()
          .setCustomId(`not-helpful-${article.id}`)
          .setLabel('Not Helpful')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('👎')
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      // Increment views (fire & forget)
      apiClient.post(
        `/api/v1/articles/${slug}/view`,
        {},
        { headers: { 'X-Server-Id': serverId } }
      ).catch((err) => console.error('Failed to increment views:', err));
    } catch (error: unknown) {
      console.error('View article error:', error);

      const is404 = axios.isAxiosError(error) && error.response?.status === 404;
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Article Not Found')
        .setDescription(
          is404
            ? `No article found with slug "${slug}"`
            : 'An error occurred while fetching the article.'
        );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};

export default command;
