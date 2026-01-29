import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ComponentType,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

const RESULTS_PER_PAGE = 5;

interface SearchResult {
  title: string;
  slug: string;
  excerpt?: string;
  categoryEmoji?: string;
  views?: number;
  helpful?: number;
}

function createSearchEmbed(
  query: string,
  results: SearchResult[],
  total: number,
  page: number
): EmbedBuilder {
  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);
  const startIndex = (page - 1) * RESULTS_PER_PAGE;
  const pageResults = results.slice(startIndex, startIndex + RESULTS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor(DISCORD_COLORS.BLURPLE)
    .setTitle(`🔍 Search Results for "${query}"`)
    .setDescription(`Found ${total} result(s) • Page ${page}/${totalPages}`);

  for (const result of pageResults) {
    const excerpt = result.excerpt?.substring(0, 100) || 'No preview available';
    const views = result.views ?? 0;
    const helpful = result.helpful ?? 0;

    embed.addFields({
      name: `${result.categoryEmoji || '📄'} ${result.title || 'Untitled'}`,
      value: `${excerpt}${excerpt.length >= 100 ? '...' : ''}\n\`/wiki-view ${result.slug}\` • ${views} views • ${helpful} helpful`,
    });
  }

  embed.setFooter({
    text: `Use /wiki-view [slug] to read full articles`,
  });

  return embed;
}

function createPaginationButtons(page: number, totalPages: number, query: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`search-prev-${page}-${encodeURIComponent(query)}`)
      .setLabel('Previous')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('◀️')
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`search-page-info`)
      .setLabel(`${page} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`search-next-${page}-${encodeURIComponent(query)}`)
      .setLabel('Next')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('▶️')
      .setDisabled(page >= totalPages)
  );
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-search')
    .setDescription('Search for articles in the knowledge base')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('What are you looking for?')
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(200)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    try {
      // Search articles via API - get more results for pagination
      const response = await apiClient.get('/api/v1/search', {
        params: {
          q: query,
          type: 'fulltext',
          limit: 25, // Get more for pagination
        },
        headers: {
          'X-Server-Id': serverId,
        },
      });

      const { results, total } = response.data;

      if (!results || results.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(DISCORD_COLORS.YELLOW)
          .setTitle('🔍 No Results Found')
          .setDescription(`No articles found for "${query}"`)
          .setFooter({ text: 'Try using different keywords or creating a new article!' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const totalPages = Math.ceil(Math.min(total, results.length) / RESULTS_PER_PAGE);
      const embed = createSearchEmbed(query, results, Math.min(total, results.length), 1);

      // Only show pagination if more than one page
      if (totalPages > 1) {
        const row = createPaginationButtons(1, totalPages, query);
        const message = await interaction.editReply({ embeds: [embed], components: [row] });

        // Handle pagination button clicks
        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 300000, // 5 minutes
          filter: (i) => i.user.id === interaction.user.id,
        });

        collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
          const customId = buttonInteraction.customId;

          if (customId.startsWith('search-prev-') || customId.startsWith('search-next-')) {
            const parts = customId.split('-');
            const currentPage = parseInt(parts[2], 10);
            const newPage = customId.startsWith('search-prev-') ? currentPage - 1 : currentPage + 1;

            const newEmbed = createSearchEmbed(query, results, Math.min(total, results.length), newPage);
            const newRow = createPaginationButtons(newPage, totalPages, query);

            await buttonInteraction.update({ embeds: [newEmbed], components: [newRow] });
          }
        });

        collector.on('end', async () => {
          // Remove buttons after timeout
          try {
            await interaction.editReply({ components: [] });
          } catch {
            // Message may have been deleted
          }
        });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = extractApiErrorMessage(error, 'An error occurred while searching. Please try again later.');
      await interaction.editReply({ embeds: [createErrorEmbed('Search Failed', errorMessage)] });
    }
  },
};

export default command;
