import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-create')
    .setDescription('Create a new article in the knowledge base'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if user has permission to create articles (MANAGE_MESSAGES or ADMINISTRATOR)
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Permission Denied')
        .setDescription('You need the **Manage Messages** permission to create articles.');

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Create modal for article input
    const modal = new ModalBuilder()
      .setCustomId('wiki-create-article-modal')
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
    const filter = (i: ModalSubmitInteraction) =>
      i.customId === 'wiki-create-article-modal' && i.user.id === interaction.user.id;

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
          text: `Use /wiki-view ${article.slug} to view this article`,
        });

      await modalInteraction.editReply({ embeds: [embed] });
    } catch (error: unknown) {
      // Modal timeout - silently ignore
      if (error instanceof Error && error.name === 'InteractionCollectorError') {
        return;
      }

      console.error('Create article error:', error);

      // Extract error message safely
      let errorMessage = 'An error occurred while creating the article.';
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = 'An article with this title already exists.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to create articles.';
        }
      }

      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.RED)
        .setTitle('❌ Failed to Create Article')
        .setDescription(errorMessage);

      try {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } catch {
        // Interaction already expired
      }
    }
  },
};

export default command;
