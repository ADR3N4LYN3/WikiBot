import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AutocompleteInteraction,
  PermissionFlagsBits,
} from 'discord.js';

import { apiClient } from '../services/apiClient';
import { Command } from '../types';
import { createErrorEmbed, extractApiErrorMessage } from '../utils/embeds';

interface Member {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
}

const ROLE_EMOJI: Record<string, string> = {
  owner: '👑',
  admin: '🛡️',
  editor: '✏️',
  viewer: '👁️',
};

// Cache for autocomplete
const memberCache = new Map<string, { data: Member[]; timestamp: number }>();
const CACHE_TTL = 60000;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wiki-member')
    .setDescription('Manage wiki members and their roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all wiki members')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a member to the wiki')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Discord user to add')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('role')
            .setDescription('Role to assign')
            .setRequired(true)
            .addChoices(
              { name: '🛡️ Admin - Full management access', value: 'admin' },
              { name: '✏️ Editor - Can edit articles', value: 'editor' },
              { name: '👁️ Viewer - Read only', value: 'viewer' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('role')
        .setDescription("Change a member's role")
        .addStringOption((option) =>
          option
            .setName('member')
            .setDescription('Member to update')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName('new-role')
            .setDescription('New role to assign')
            .setRequired(true)
            .addChoices(
              { name: '🛡️ Admin - Full management access', value: 'admin' },
              { name: '✏️ Editor - Can edit articles', value: 'editor' },
              { name: '👁️ Viewer - Read only', value: 'viewer' }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a member from the wiki')
        .addStringOption((option) =>
          option
            .setName('member')
            .setDescription('Member to remove')
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const serverId = interaction.guildId;
    if (!serverId) return;

    const focusedValue = interaction.options.getFocused().toLowerCase();
    const cacheKey = `members-${serverId}`;

    try {
      const cached = memberCache.get(cacheKey);
      let members: Member[];

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        members = cached.data;
      } else {
        const response = await apiClient.get('/api/v1/members', {
          headers: { 'X-Server-Id': serverId },
        });
        members = response.data || [];
        memberCache.set(cacheKey, { data: members, timestamp: Date.now() });
      }

      // Filter out owner (can't be modified) and filter by search
      const filtered = members
        .filter((m) => m.role !== 'owner')
        .filter(
          (m) =>
            m.user.username.toLowerCase().includes(focusedValue) ||
            m.userId.includes(focusedValue)
        )
        .slice(0, 25);

      await interaction.respond(
        filtered.map((m) => ({
          name: `${ROLE_EMOJI[m.role]} ${m.user.username} (${m.role})`.substring(0, 100),
          value: m.userId,
        }))
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
      await interaction.respond([]);
    }
  },

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
      case 'add':
        await handleAdd(interaction, serverId);
        break;
      case 'role':
        await handleRole(interaction, serverId);
        break;
      case 'remove':
        await handleRemove(interaction, serverId);
        break;
    }
  },
};

async function handleList(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  try {
    const response = await apiClient.get('/api/v1/members', {
      headers: { 'X-Server-Id': serverId },
    });

    const members: Member[] = response.data || [];

    if (members.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(DISCORD_COLORS.BLURPLE)
        .setTitle('👥 Wiki Members')
        .setDescription('No members found. Use `/wiki-member add` to add members!');

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Group by role
    const byRole: Record<string, Member[]> = {
      owner: [],
      admin: [],
      editor: [],
      viewer: [],
    };

    for (const member of members) {
      if (byRole[member.role]) {
        byRole[member.role].push(member);
      }
    }

    const lines: string[] = [];

    for (const role of ['owner', 'admin', 'editor', 'viewer']) {
      const roleMembers = byRole[role];
      if (roleMembers.length > 0) {
        lines.push(`**${ROLE_EMOJI[role]} ${role.charAt(0).toUpperCase() + role.slice(1)}s**`);
        for (const m of roleMembers) {
          const joinedDate = new Date(m.joinedAt).toLocaleDateString();
          lines.push(`  └ ${m.user.username} • Joined ${joinedDate}`);
        }
        lines.push('');
      }
    }

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.BLURPLE)
      .setTitle('👥 Wiki Members')
      .setDescription(lines.join('\n').trim())
      .setFooter({ text: `${members.length} member${members.length !== 1 ? 's' : ''} total` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('List members error:', error);
    const message = extractApiErrorMessage(error, 'Failed to fetch members');
    await interaction.editReply({ embeds: [createErrorEmbed('Error', message)] });
  }
}

async function handleAdd(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const user = interaction.options.getUser('user', true);
  const role = interaction.options.getString('role', true) as 'admin' | 'editor' | 'viewer';

  try {
    await apiClient.post(
      '/api/v1/members',
      {
        userId: user.id,
        role,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar || undefined,
      },
      {
        headers: { 'X-Server-Id': serverId },
      }
    );

    // Invalidate cache
    memberCache.delete(`members-${serverId}`);

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.GREEN)
      .setTitle('✅ Member Added')
      .setDescription(`${user.username} has been added to the wiki!`)
      .addFields(
        { name: 'User', value: `<@${user.id}>`, inline: true },
        { name: 'Role', value: `${ROLE_EMOJI[role]} ${role}`, inline: true }
      )
      .setThumbnail(user.displayAvatarURL());

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Add member error:', error);

    const is409 = axios.isAxiosError(error) && error.response?.status === 409;
    const message = extractApiErrorMessage(error, 'Failed to add member');

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is409 ? 'Member Already Exists' : 'Error',
          is409 ? `${user.username} is already a member of this wiki.` : message
        ),
      ],
    });
  }
}

async function handleRole(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const userId = interaction.options.getString('member', true);
  const newRole = interaction.options.getString('new-role', true) as 'admin' | 'editor' | 'viewer';

  try {
    const response = await apiClient.put(
      `/api/v1/members/${userId}/role`,
      { role: newRole },
      {
        headers: { 'X-Server-Id': serverId },
      }
    );

    const member = response.data;

    // Invalidate cache
    memberCache.delete(`members-${serverId}`);

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.GREEN)
      .setTitle('✅ Role Updated')
      .setDescription(`${member.user.username}'s role has been updated!`)
      .addFields(
        { name: 'User', value: `<@${userId}>`, inline: true },
        { name: 'New Role', value: `${ROLE_EMOJI[newRole]} ${newRole}`, inline: true }
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Update role error:', error);

    const is403 = axios.isAxiosError(error) && error.response?.status === 403;
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    const message = extractApiErrorMessage(error, 'Failed to update role');

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is403 ? 'Permission Denied' : is404 ? 'Member Not Found' : 'Error',
          is403
            ? "You don't have permission to modify this member's role."
            : is404
              ? 'This user is not a member of the wiki.'
              : message
        ),
      ],
    });
  }
}

async function handleRemove(interaction: ChatInputCommandInteraction, serverId: string) {
  await interaction.deferReply();

  const userId = interaction.options.getString('member', true);

  try {
    // Get member info first for the confirmation message
    const memberResponse = await apiClient.get(`/api/v1/members/${userId}`, {
      headers: { 'X-Server-Id': serverId },
    });
    const member = memberResponse.data;

    await apiClient.delete(`/api/v1/members/${userId}`, {
      headers: { 'X-Server-Id': serverId },
    });

    // Invalidate cache
    memberCache.delete(`members-${serverId}`);

    const embed = new EmbedBuilder()
      .setColor(DISCORD_COLORS.GREEN)
      .setTitle('✅ Member Removed')
      .setDescription(`${member.user.username} has been removed from the wiki.`)
      .addFields({ name: 'User', value: `<@${userId}>`, inline: true });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Remove member error:', error);

    const is403 = axios.isAxiosError(error) && error.response?.status === 403;
    const is404 = axios.isAxiosError(error) && error.response?.status === 404;
    const message = extractApiErrorMessage(error, 'Failed to remove member');

    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          is403 ? 'Permission Denied' : is404 ? 'Member Not Found' : 'Error',
          is403
            ? "You don't have permission to remove this member."
            : is404
              ? 'This user is not a member of the wiki.'
              : message
        ),
      ],
    });
  }
}

export default command;
