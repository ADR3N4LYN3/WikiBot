import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands and how to use them'),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('📚 WikiBot Commands')
      .setDescription(
        'WikiBot helps you create and manage a knowledge base directly in Discord. ' +
        'Here are all the available commands:'
      )
      .addFields(
        {
          name: '🔍 /search `query`',
          value: 'Search for articles in your server\'s knowledge base.\n' +
                 '**Example:** `/search how to setup`',
        },
        {
          name: '📖 /view `slug`',
          value: 'View a specific article by its slug (URL-friendly name).\n' +
                 '**Example:** `/view getting-started`',
        },
        {
          name: '✏️ /create',
          value: 'Create a new article. Opens a form to enter the title, content, and optional category.',
        },
        {
          name: '❓ /help',
          value: 'Show this help message with all available commands.',
        }
      )
      .addFields(
        {
          name: '\u200B',
          value: '**📊 Features**',
        },
        {
          name: '✅ Feedback System',
          value: 'Rate articles as helpful or not helpful using the buttons below each article.',
          inline: true,
        },
        {
          name: '📈 View Tracking',
          value: 'Track how many times each article has been viewed.',
          inline: true,
        },
        {
          name: '📁 Categories',
          value: 'Organize articles into categories for easy navigation.',
          inline: true,
        }
      )
      .setFooter({
        text: 'WikiBot • Your Discord Knowledge Base',
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    // Add useful links
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL(process.env.DASHBOARD_URL || 'https://wikibot-app.xyz')
        .setEmoji('🌐'),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(process.env.SUPPORT_URL || 'https://discord.gg/wikibot')
        .setEmoji('💬'),
      new ButtonBuilder()
        .setLabel('Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL(`${process.env.DASHBOARD_URL || 'https://wikibot-app.xyz'}/invite`)
        .setEmoji('➕')
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};

export default command;
