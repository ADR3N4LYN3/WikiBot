import { DISCORD_COLORS } from '@wikibot/shared';
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View an article from the knowledge base')
    .addStringOption(option =>
      option
        .setName('slug')
        .setDescription('The slug of the article to view')
        .setRequired(true)
    ),

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

      // Create embed
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle(`${article.category?.emoji || '📄'} ${article.title}`)
        .setDescription(article.content.substring(0, 4000)) // Discord embed limit
        .addFields(
          {
            name: '👤 Author',
            value: article.author.username,
            inline: true,
          },
          {
            name: '👀 Views',
            value: article.views.toString(),
            inline: true,
          },
          {
            name: '👍 Helpful',
            value: `${article.helpful} / ${article.helpful + article.notHelpful}`,
            inline: true,
          }
        )
        .setFooter({
          text: `Last updated ${new Date(article.updatedAt).toLocaleDateString()}`,
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

      // Increment views
      await apiClient.post(
        `/api/v1/articles/${slug}/view`,
        {},
        {
          headers: {
            'X-Server-Id': serverId,
          },
        }
      );
    } catch (error: any) {
      console.error('View article error:', error);

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Article Not Found')
        .setDescription(
          error.response?.status === 404
            ? `No article found with slug "${slug}"`
            : 'An error occurred while fetching the article.'
        );

      await interaction.editReply({ embeds: [embed] });
    }
  },
};

export default command;
