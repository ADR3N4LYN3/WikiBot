import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-stats')
    .setDescription('View knowledge base statistics for this server'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.editReply('❌ This command can only be used in a server!');
      return;
    }

    try {
      // Get server stats from API
      const response = await apiClient.get(`/api/v1/stats/server/${serverId}`);

      const stats = response.data;

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('📊 Knowledge Base Statistics')
        .setDescription(`Stats for **${interaction.guild?.name || 'this server'}**`)
        .addFields(
          {
            name: '📄 Articles',
            value: stats.articles.toString(),
            inline: true,
          },
          {
            name: '📁 Categories',
            value: stats.categories.toString(),
            inline: true,
          },
          {
            name: '🔍 Searches (30d)',
            value: stats.searches.toString(),
            inline: true,
          },
          {
            name: '👀 Total Views',
            value: stats.totalViews.toLocaleString(),
            inline: true,
          }
        )
        .setFooter({
          text: `Last updated: ${new Date(stats.timestamp).toLocaleString()}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Stats error:', error);
      const errorMessage = extractApiErrorMessage(error, 'An error occurred while fetching statistics.');
      await interaction.editReply({ embeds: [createErrorEmbed('Failed to Get Stats', errorMessage)] });
    }
  },
};

export default command;
