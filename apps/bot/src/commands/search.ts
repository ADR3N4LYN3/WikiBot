import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('search')
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
      // Search articles via API
      const response = await apiClient.get('/api/v1/search', {
        params: {
          q: query,
          type: 'fulltext',
          limit: 10,
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

      // Create embed with results
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle(`🔍 Search Results for "${query}"`)
        .setDescription(`Found ${total} result(s)`);

      // Add top 5 results as fields
      for (const result of results.slice(0, 5)) {
        embed.addFields({
          name: `${result.categoryEmoji || '📄'} ${result.title}`,
          value: `${result.excerpt.substring(0, 100)}...\n\`/view ${result.slug}\` • ${result.views} views • ${result.helpful} helpful`,
        });
      }

      embed.setFooter({
        text: `Use /view [slug] to read full articles`,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Search error:', error);

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Search Failed')
        .setDescription('An error occurred while searching. Please try again later.');

      await interaction.editReply({ embeds: [embed] });
    }
  },
};

export default command;
