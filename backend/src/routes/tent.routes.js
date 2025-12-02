import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tents (public)
router.get('/', async (req, res) => {
    try {
        const tents = await prisma.tent.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                products: {
                    take: 5,
                    include: {
                        images: {
                            take: 1,
                        },
                    },
                },
            },
        });
        res.json(tents);
    } catch (error) {
        console.error('Get tents error:', error);
        res.status(500).json({ error: 'Failed to fetch tents' });
    }
});

// Get single tent by ID
router.get('/:id', async (req, res) => {
    try {
        const tent = await prisma.tent.findUnique({
            where: { id: req.params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                products: {
                    include: {
                        images: true,
                    },
                },
            },
        });

        if (!tent) {
            return res.status(404).json({ error: 'Tent not found' });
        }

        res.json(tent);
    } catch (error) {
        console.error('Get tent error:', error);
        res.status(500).json({ error: 'Failed to fetch tent' });
    }
});

// Create new tent (authenticated)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, bannerImage } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Tent name is required' });
        }

        const tent = await prisma.tent.create({
            data: {
                name,
                description,
                bannerImage,
                ownerId: req.user.id,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json(tent);
    } catch (error) {
        console.error('Create tent error:', error);
        res.status(500).json({ error: 'Failed to create tent' });
    }
});

// Update tent (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, bannerImage } = req.body;

        // Check if user owns the tent
        const existingTent = await prisma.tent.findUnique({
            where: { id: req.params.id },
        });

        if (!existingTent) {
            return res.status(404).json({ error: 'Tent not found' });
        }

        if (existingTent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this tent' });
        }

        const tent = await prisma.tent.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                bannerImage,
            },
        });

        res.json(tent);
    } catch (error) {
        console.error('Update tent error:', error);
        res.status(500).json({ error: 'Failed to update tent' });
    }
});

// Delete tent (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const existingTent = await prisma.tent.findUnique({
            where: { id: req.params.id },
        });

        if (!existingTent) {
            return res.status(404).json({ error: 'Tent not found' });
        }

        if (existingTent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this tent' });
        }

        await prisma.tent.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Tent deleted successfully' });
    } catch (error) {
        console.error('Delete tent error:', error);
        res.status(500).json({ error: 'Failed to delete tent' });
    }
});

// Get user's tents
router.get('/user/my-tents', authenticateToken, async (req, res) => {
    try {
        const tents = await prisma.tent.findMany({
            where: { ownerId: req.user.id },
            include: {
                products: {
                    include: {
                        images: {
                            take: 1,
                        },
                    },
                },
            },
        });
        res.json(tents);
    } catch (error) {
        console.error('Get user tents error:', error);
        res.status(500).json({ error: 'Failed to fetch user tents' });
    }
});

export default router;
