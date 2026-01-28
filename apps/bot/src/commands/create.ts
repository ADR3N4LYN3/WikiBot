import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create a new article in the knowledge base'),

  async execute(interaction: CommandInteraction) {
    // Create modal for article input
    const modal = new ModalBuilder()
      .setCustomId('create-article-modal')
      .setTitle('Create New Article');

    // Title input
    const titleInput = new TextInputBuilder()
      .setCustomId('article-title')
      .setLabel('Article Title')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g., How to get started')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(200);

    // Content input
    const contentInput = new TextInputBuilder()
      .setCustomId('article-content')
      .setLabel('Article Content (Markdown supported)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Write your article content here...')
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(4000);

    // Category input (optional)
    const categoryInput = new TextInputBuilder()
      .setCustomId('article-category')
      .setLabel('Category Slug (optional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g., general, faq')
      .setRequired(false)
      .setMaxLength(100);

    // Add inputs to modal
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(categoryInput)
    );

    await interaction.showModal(modal);

    // Listen for modal submission
    const filter = (i: any) =>
      i.customId === 'create-article-modal' && i.user.id === interaction.user.id;

    try {
      const modalInteraction = await interaction.awaitModalSubmit({
        filter,
        time: 300000, // 5 minutes
      });

      await modalInteraction.deferReply();

      const title = modalInteraction.fields.getTextInputValue('article-title');
      const content = modalInteraction.fields.getTextInputValue('article-content');
      const categorySlug = modalInteraction.fields.getTextInputValue('article-category') || undefined;

      const serverId = interaction.guildId;

      if (!serverId) {
        await modalInteraction.editReply('❌ This command can only be used in a server!');
        return;
      }

      // Create article via API
      const response = await apiClient.post(
        '/api/v1/articles',
        {
          title,
          content,
          categorySlug,
        },
        {
          headers: {
            'X-Server-Id': serverId,
          },
        }
      );

      const article = response.data;

      // Success embed
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.GREEN)
        .setTitle('✅ Article Created!')
        .setDescription(`**${article.title}** has been added to the knowledge base.`)
        .addFields(
          { name: 'Slug', value: `\`${article.slug}\``, inline: true },
          {
            name: 'Category',
            value: article.category?.name || 'None',
            inline: true,
          }
        )
        .setFooter({
          text: `Use /view ${article.slug} to view this article`,
        });

      await modalInteraction.editReply({ embeds: [embed] });
    } catch (error: any) {
      console.error('Create article error:', error);

      // Modal timeout or error
      if (error.code === 'InteractionCollectorError') {
        // Modal timed out, ignore
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Failed to Create Article')
        .setDescription(
          error.response?.data?.message || 'An error occurred while creating the article.'
        );

      try {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } catch {
        // Interaction already expired
      }
    }
  },
};

export default command;
