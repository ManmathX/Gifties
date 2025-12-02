import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: req.params.productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create a review (authenticated users who purchased the product)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ error: 'Product ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Verify user has purchased this product
        const order = await prisma.order.findFirst({
            where: {
                userId: req.user.id,
                status: {
                    in: ['PAID', 'SHIPPED', 'DELIVERED'],
                },
                items: {
                    some: {
                        productId: productId,
                    },
                },
            },
        });

        if (!order) {
            return res.status(403).json({
                error: 'You can only review products you have purchased'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: req.user.id,
                productId: productId,
            },
        });

        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                userId: req.user.id,
                productId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// Update a review (author only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const existingReview = await prisma.review.findUnique({
            where: { id: req.params.id },
        });

        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (existingReview.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this review' });
        }

        const review = await prisma.review.update({
            where: { id: req.params.id },
            data: {
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.json(review);
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Delete a review (author only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const existingReview = await prisma.review.findUnique({
            where: { id: req.params.id },
        });

        if (!existingReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (existingReview.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await prisma.review.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;
