import { Events, Guild } from 'discord.js';

import { client } from '../index';
import { apiClient } from '../services/apiClient';

client.on(Events.GuildDelete, async (guild: Guild) => {
  console.log(`👋 Bot removed from server: ${guild.name} (${guild.id})`);

  try {
    // Notify API that bot left the server (for cleanup/analytics)
    await apiClient.delete(`/api/v1/servers/${guild.id}/leave`);
    console.log(`✅ Server ${guild.name} marked as inactive`);
  } catch (error) {
    // Don't fail silently - log for debugging
    console.error(`❌ Failed to notify API about leaving ${guild.name}:`, error);
  }
});
