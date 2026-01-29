import { DISCORD_COLORS } from '@wikibot/shared';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';

/**
 * Creates a standardized error embed
 */
export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(DISCORD_COLORS.RED)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Creates a standardized success embed
 */
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(DISCORD_COLORS.GREEN)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Creates a standardized warning embed
 */
export function createWarningEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(DISCORD_COLORS.YELLOW)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Creates a standardized info embed
 */
export function createInfoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(DISCORD_COLORS.BLURPLE)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

/**
 * Extracts error message from API error response
 */
export function extractApiErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (typeof data.error === 'string') {
      return data.error;
    }
  }
  return defaultMessage;
}

/**
 * Creates an embed for API errors with proper message extraction
 */
export function createApiErrorEmbed(error: unknown, defaultMessage: string): EmbedBuilder {
  const message = extractApiErrorMessage(error, defaultMessage);
  return createErrorEmbed('Error', message);
}
