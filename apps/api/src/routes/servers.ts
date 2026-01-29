import { prisma } from '@wikibot/database';
import { Router } from 'express';

const router = Router();

// POST /api/v1/servers - Create or update a server entry
router.post('/', async (req, res, next) => {
  try {
    const { id, name } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id and name',
      });
    }

    // Upsert server entry
    const server = await prisma.server.upsert({
      where: { id },
      create: {
        id,
        name,
      },
      update: {
        name,
      },
    });

    console.log(`✅ Server synced: ${name} (${id})`);

    return res.status(201).json({
      success: true,
      server,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/servers/check - Check which guild IDs have bot installed
// IMPORTANT: Must be before /:id to avoid route conflicts
router.post('/check', async (req, res, next) => {
  try {
    const { guildIds } = req.body;

    if (!Array.isArray(guildIds)) {
      return res.status(400).json({
        success: false,
        error: 'guildIds must be an array',
      });
    }

    const servers = await prisma.server.findMany({
      where: {
        id: {
          in: guildIds,
        },
      },
      select: {
        id: true,
      },
    });

    console.log(`🔍 Server check: ${guildIds.length} requested, ${servers.length} found`);

    return res.json({
      success: true,
      serverIds: servers.map((s) => s.id),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/servers/:id - Get a specific server
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const server = await prisma.server.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: {
          select: {
            articles: true,
            categories: true,
          },
        },
      },
    });

    if (!server) {
      return res.status(404).json({
        success: false,
        error: 'Server not found',
      });
    }

    return res.json({
      success: true,
      server,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/servers/:id - Delete a server (when bot leaves)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.server.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Server deleted',
    });
  } catch (error) {
    next(error);
  }
});

export const serversRouter = router;
