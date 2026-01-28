import { Events } from 'discord.js';

import { client } from '../index';
import { apiClient } from '../services/apiClient';

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, error);
    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Handle button interactions (Helpful/Not Helpful)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  const serverId = interaction.guildId;

  if (!serverId) return;

  // Handle helpful/not-helpful buttons
  if (customId.startsWith('helpful-') || customId.startsWith('not-helpful-')) {
    const isHelpful = customId.startsWith('helpful-');
    const articleId = customId.replace('helpful-', '').replace('not-helpful-', '');

    try {
      await interaction.deferUpdate();

      await apiClient.post(
        `/api/v1/articles/${articleId}/feedback`,
        { helpful: isHelpful },
        { headers: { 'X-Server-Id': serverId } }
      );

      await interaction.followUp({
        content: isHelpful
          ? '👍 Thanks for the feedback! Glad this was helpful.'
          : '👎 Thanks for the feedback! We\'ll work on improving this.',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Feedback error:', error);
      await interaction.followUp({
        content: '❌ Failed to record feedback. Please try again.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
});
