import { DISCORD_COLORS } from '@wikibot/shared';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

interface AuditLog {
  id: string;
  serverId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatar?: string;
  };
}

const ACTION_EMOJI: Record<string, string> = {
  article_create: '📝',
  article_update: '✏️',
  article_delete: '🗑️',
  category_create: '📁',
  category_update: '📂',
  category_delete: '🗑️',
  category_reorder: '🔄',
  settings_update: '⚙️',
  member_add: '👤',
  member_update: '🔄',
  member_remove: '👤',
  ownership_transfer: '👑',
  import_articles: '📥',
  export_articles: '📤',
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-audit')
    .setDescription('View wiki audit logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('View recent audit logs')
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('Number of logs to show (default: 10)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(25)
        )
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('Filter by entity type')
            .setRequired(false)
            .addChoices(
              { name: '📄 Articles', value: 'article' },
              { name: '📁 Categories', value: 'category' },
              { name: '⚙️ Settings', value: 'settings' },
              { name: '👤 Members', value: 'member' }
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
      case 'list':
        await handleList(interaction, serverId);
        break;
    }
  },
};

async function handleList(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const limit = interaction.options.getInteger('limit') || 10;
  const entityType = interaction.options.getString('type');

  try {
    const params: Record<string, string | number> = { limit };
    if (entityType) {
      params.entityType = entityType;
    }

    const response = await apiClient.get('/api/v1/audit-logs', {
      headers: { 'X-Server-Id': serverId },
      params,
    });

    const logs: AuditLog[] = response.data?.logs || response.data || [];

    if (logs.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('📋 Audit Logs')
        .setDescription(
          entityType
            ? `No ${entityType} logs found.`
            : 'No audit logs found yet.'
        );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const lines = logs.map((log) => {
      const actionEmoji = ACTION_EMOJI[log.action] || '❓';
      const timestamp = new Date(log.createdAt);
      const timeAgo = getTimeAgo(timestamp);

      // Format action name
      const actionName = log.action
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Parse details if available
      let detailsText = '';
      if (log.details) {
        try {
          const details = JSON.parse(log.details);
          if (details.title) {
            detailsText = ` • "${details.title}"`;
          } else if (details.name) {
            detailsText = ` • "${details.name}"`;
          } else if (details.newRole) {
            detailsText = ` → ${details.newRole}`;
          }
        } catch {
          // Ignore parse errors
        }
      }

      return `${actionEmoji} **${actionName}**${detailsText}\n   └ by ${log.actor.username} • ${timeAgo}`;
    });

    const title = entityType
      ? `📋 Audit Logs (${entityType})`
      : '📋 Recent Audit Logs';

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle(title)
      .setDescription(lines.join('\n\n'))
      .setFooter({ text: `Showing ${logs.length} log${logs.length !== 1 ? 's' : ''}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Audit logs error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch audit logs');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default command;
