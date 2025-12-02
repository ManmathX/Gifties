import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create new order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        // Verify stock availability
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }
        }

        // Create order with items
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        customizedPhotoUrl: item.customizedPhotoUrl,
                        customizedMessage: item.customizedMessage,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    take: 1,
                                },
                            },
                        },
                    },
                },
            },
        });

        // Update product stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    take: 1,
                                },
                                tent: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                tent: true,
                            },
                        },
                    },
                },
                payment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user owns the order or owns the tent
        const isOwner = order.userId === req.user.id;
        const isTentOwner = order.items.some(item =>
            item.product.tent.ownerId === req.user.id
        );

        if (!isOwner && !isTentOwner) {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Update order status (tent owner only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                tent: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user owns any tent in the order
        const isTentOwner = order.items.some(item =>
            item.product.tent.ownerId === req.user.id
        );

        if (!isTentOwner) {
            return res.status(403).json({ error: 'Not authorized to update this order' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                payment: true,
            },
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get orders for tent owner
router.get('/tent/:tentId', authenticateToken, async (req, res) => {
    try {
        // Verify user owns the tent
        const tent = await prisma.tent.findUnique({
            where: { id: req.params.tentId },
        });

        if (!tent) {
            return res.status(404).json({ error: 'Tent not found' });
        }

        if (tent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to view these orders' });
        }

        // Get all orders containing products from this tent
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            tentId: req.params.tentId,
                        },
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                payment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(orders);
    } catch (error) {
        console.error('Get tent orders error:', error);
        res.status(500).json({ error: 'Failed to fetch tent orders' });
    }
});

export default router;
