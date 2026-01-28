import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@wikibot/database';

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

// Permission flag for MANAGE_GUILD
const MANAGE_GUILD = 0x20;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's guilds from Discord API
    const discordResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!discordResponse.ok) {
      console.error('Discord API error:', await discordResponse.text());
      return NextResponse.json(
        { error: 'Failed to fetch guilds from Discord' },
        { status: 500 }
      );
    }

    const userGuilds: DiscordGuild[] = await discordResponse.json();

    // Filter guilds where user has MANAGE_GUILD permission
    const manageableGuilds = userGuilds.filter((guild) => {
      const permissions = BigInt(guild.permissions);
      return guild.owner || (permissions & BigInt(MANAGE_GUILD)) !== BigInt(0);
    });

    // Get guild IDs where user has permission
    const guildIds = manageableGuilds.map((g) => g.id);

    // Fetch servers from database that match these guild IDs (bot is installed there)
    const installedServers = await prisma.server.findMany({
      where: {
        id: {
          in: guildIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create a set of installed server IDs for quick lookup
    const installedServerIds = new Set(installedServers.map((s) => s.id));

    // Combine Discord data with our database
    const servers = manageableGuilds
      .filter((guild) => installedServerIds.has(guild.id))
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
      }));

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
