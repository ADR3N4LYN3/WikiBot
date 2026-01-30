import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

interface ServerSettings {
  id: string;
  serverId: string;
  brandColor: string;
  logoUrl?: string;
  maxArticles: number;
  maxSearchesPerMonth: number;
  aiSearchEnabled: boolean;
  publicWebview: boolean;
  analyticsEnabled: boolean;
  searchLoggingEnabled: boolean;
  moderationEnabled: boolean;
  fastIndexingEnabled: boolean;
}

const MODULE_INFO: Record<
  string,
  { name: string; description: string; emoji: string; premium: boolean }
> = {
  aiSearchEnabled: {
    name: 'AI Search',
    description: 'AI-powered semantic search',
    emoji: '🤖',
    premium: true,
  },
  publicWebview: {
    name: 'Public Web View',
    description: 'Public access to wiki articles',
    emoji: '🌐',
    premium: false,
  },
  analyticsEnabled: {
    name: 'Analytics',
    description: 'Track article views and searches',
    emoji: '📊',
    premium: false,
  },
  searchLoggingEnabled: {
    name: 'Search Logging',
    description: 'Log search queries for analytics',
    emoji: '📝',
    premium: false,
  },
  moderationEnabled: {
    name: 'Content Moderation',
    description: 'AI-powered content moderation',
    emoji: '🛡️',
    premium: true,
  },
  fastIndexingEnabled: {
    name: 'Fast Indexing',
    description: 'Priority article indexing',
    emoji: '⚡',
    premium: true,
  },
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-settings')
    .setDescription('View and manage wiki settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName('view').setDescription('View current wiki settings')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('Enable or disable a module')
        .addStringOption((option) =>
          option
            .setName('module')
            .setDescription('Module to toggle')
            .setRequired(true)
            .addChoices(
              { name: '🌐 Public Web View', value: 'publicWebview' },
              { name: '📊 Analytics', value: 'analyticsEnabled' },
              { name: '📝 Search Logging', value: 'searchLoggingEnabled' },
              { name: '🤖 AI Search (Premium)', value: 'aiSearchEnabled' },
              { name: '🛡️ Content Moderation (Premium)', value: 'moderationEnabled' },
              { name: '⚡ Fast Indexing (Premium)', value: 'fastIndexingEnabled' }
            )
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
      case 'view':
        await handleView(interaction, serverId);
        break;
      case 'toggle':
        await handleToggle(interaction, serverId);
        break;
    }
  },
};

async function handleView(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  try {
    const response = await apiClient.get('/api/v1/settings', {
      headers: { 'X-Server-Id': serverId },
    });

    const settings: ServerSettings = response.data;

    // Build module status list
    const moduleLines = Object.entries(MODULE_INFO).map(([key, info]) => {
      const isEnabled = settings[key as keyof ServerSettings] as boolean;
      const status = isEnabled ? '✅' : '❌';
      const premiumTag = info.premium ? ' `Premium`' : '';
      return `${status} ${info.emoji} **${info.name}**${premiumTag}`;
    });

    const embed = new EmbedBuilder()
      .setColor((settings.brandColor || DISCORD_COLORS.BLURPLE) as `#${string}`)
      .setTitle('⚙️ Wiki Settings')
      .addFields(
        {
          name: '🎨 Customization',
          value: [
            `**Brand Color:** ${settings.brandColor}`,
            `**Custom Logo:** ${settings.logoUrl ? 'Yes' : 'No'}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '📊 Limits',
          value: [
            `**Max Articles:** ${settings.maxArticles === -1 ? 'Unlimited' : settings.maxArticles}`,
            `**Searches/Month:** ${settings.maxSearchesPerMonth === -1 ? 'Unlimited' : settings.maxSearchesPerMonth}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🔧 Modules',
          value: moduleLines.join('\n'),
        }
      )
      .setFooter({ text: 'Use /wiki-settings toggle to change module settings' });

    if (settings.logoUrl) {
      embed.setThumbnail(settings.logoUrl);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('View settings error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch settings');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

async function handleToggle(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const moduleKey = interaction.options.getString('module', true);
  const moduleInfo = MODULE_INFO[moduleKey];

  if (!moduleInfo) {
    await interaction.editReply({
      embeds: [createErrorEmbed('Error', 'Invalid module selected')],
    });
    return;
  }

  try {
    // Get current settings
    const getResponse = await apiClient.get('/api/v1/settings', {
      headers: { 'X-Server-Id': serverId },
    });

    const currentSettings: ServerSettings = getResponse.data;
    const currentValue = currentSettings[moduleKey as keyof ServerSettings] as boolean;
    const newValue = !currentValue;

    // Update settings
    await apiClient.put(
      '/api/v1/settings',
      { [moduleKey]: newValue },
      {
        headers: { 'X-Server-Id': serverId },
      }
    );

    const statusText = newValue ? 'enabled' : 'disabled';
    const statusEmoji = newValue ? '✅' : '❌';

    const embed = new EmbedBuilder()
      .setColor(newValue ? DISCORD_COLORS.GREEN : DISCORD_COLORS.RED)
      .setTitle(`${statusEmoji} Module ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`)
      .setDescription(
        `**${moduleInfo.emoji} ${moduleInfo.name}** has been ${statusText}.`
      )
      .addFields({
        name: 'Description',
        value: moduleInfo.description,
      });

    if (moduleInfo.premium) {
      embed.setFooter({ text: 'This is a premium feature' });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Toggle module error:', error);

    const is403 = axios.isAxiosError(error) && error.response?.status === 403;
    const message = extractApiErrorMessage(error, 'Failed to toggle module');

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is403 ? 'Premium Required' : 'Error',
          is403
            ? `**${moduleInfo.name}** requires a premium subscription. Upgrade to unlock this feature!`
            : message
        ),
      ],
    });
  }
}

export default command;
