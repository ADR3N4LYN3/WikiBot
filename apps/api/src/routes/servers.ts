import { Router } from 'express';
import { prisma } from '@wikibot/database';

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

    return res.status(201).json({
      success: true,
      server,
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
