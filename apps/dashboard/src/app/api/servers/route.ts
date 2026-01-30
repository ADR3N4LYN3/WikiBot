import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

interface WikiBotServer {
  id: string;
  name: string;
  role: string;
  source: string;
  premiumTier: string;
  joinedAt: string;
}

// Permission flag for MANAGE_GUILD
const MANAGE_GUILD = 0x20;

// Generate JWT token for API calls (same as settings route)
async function generateJWTToken(userId: string): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const { SignJWT } = await import('jose');
  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT({
    discordId: userId,
    sub: userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);

  return token;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.discordId;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Generate JWT for API calls
    const jwtToken = await generateJWTToken(userId);

    // 1. Fetch user's guilds from Discord API (for MANAGE_GUILD check)
    let discordGuilds: { id: string; name: string; icon: string | null }[] = [];

    try {
      const discordResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (discordResponse.ok) {
        const userGuilds: DiscordGuild[] = await discordResponse.json();

        // Filter guilds where user has MANAGE_GUILD permission
        discordGuilds = userGuilds
          .filter((guild) => {
            const permissions = BigInt(guild.permissions);
            return guild.owner || (permissions & BigInt(MANAGE_GUILD)) !== BigInt(0);
          })
          .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));
      }
    } catch (error) {
      console.error('Discord API error:', error);
      // Continue without Discord guilds - WikiBot memberships might still work
    }

    // 2. Fetch servers where user is a WikiBot member (added via dashboard)
    let wikibotServers: WikiBotServer[] = [];

    if (jwtToken) {
      try {
        const membershipResponse = await fetch(`${apiUrl}/api/v1/members/my-servers`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (membershipResponse.ok) {
          const data = await membershipResponse.json();
          wikibotServers = data.servers || [];
        }
      } catch (error) {
        console.error('WikiBot API error:', error);
        // Continue without WikiBot servers
      }
    }

    // 3. Get all unique server IDs from both sources
    const allGuildIds = [
      ...discordGuilds.map((g) => g.id),
      ...wikibotServers.map((s) => s.id),
    ];
    const uniqueGuildIds = [...new Set(allGuildIds)];

    // 4. Check which servers have the bot installed
    let installedServerIds: string[] = [];

    if (uniqueGuildIds.length > 0) {
      try {
        const checkResponse = await fetch(`${apiUrl}/api/v1/servers/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guildIds: uniqueGuildIds }),
        });

        if (checkResponse.ok) {
          const data = await checkResponse.json();
          installedServerIds = data.serverIds || [];
        }
      } catch (error) {
        console.error('Server check error:', error);
      }
    }

    const installedSet = new Set(installedServerIds);

    // 5. Build final server list - merge Discord and WikiBot sources
    const serverMap = new Map<string, {
      id: string;
      name: string;
      icon: string | null;
      source: 'discord' | 'wikibot';
      role?: string;
    }>();

    // Add Discord servers first (they have better data like icons)
    for (const guild of discordGuilds) {
      if (installedSet.has(guild.id)) {
        serverMap.set(guild.id, {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          source: 'discord',
        });
      }
    }

    // Add WikiBot servers (only if not already present from Discord)
    for (const server of wikibotServers) {
      if (installedSet.has(server.id) && !serverMap.has(server.id)) {
        serverMap.set(server.id, {
          id: server.id,
          name: server.name,
          icon: null, // WikiBot doesn't store icons
          source: 'wikibot',
          role: server.role,
        });
      }
    }

    const servers = Array.from(serverMap.values());

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
