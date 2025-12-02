import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with filtering
router.get('/', async (req, res) => {
    try {
        const { category, tentId, search, minPrice, maxPrice } = req.query;

        const where = {};

        if (category) {
            where.category = category;
        }

        if (tentId) {
            where.tentId = tentId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                tent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate average rating for each product
        const productsWithRating = products.map(product => ({
            ...product,
            averageRating: product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0,
            reviewCount: product.reviews.length,
        }));

        res.json(productsWithRating);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                images: true,
                tent: {
                    select: {
                        id: true,
                        name: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                reviews: {
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
                },
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Calculate average rating
        const averageRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : 0;

        res.json({
            ...product,
            averageRating,
            reviewCount: product.reviews.length,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create new product (tent owner only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, price, stock, category, details, tentId, images } = req.body;

        // Verify user owns the tent
        const tent = await prisma.tent.findUnique({
            where: { id: tentId },
        });

        if (!tent) {
            return res.status(404).json({ error: 'Tent not found' });
        }

        if (tent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to add products to this tent' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock: stock || 0,
                category,
                details,
                tentId,
                images: {
                    create: images?.map(url => ({ url })) || [],
                },
            },
            include: {
                images: true,
                tent: true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (tent owner only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description, price, stock, category, details, images } = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { tent: true },
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (existingProduct.tent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this product' });
        }

        // Delete existing images if new ones provided
        if (images) {
            await prisma.productImage.deleteMany({
                where: { productId: req.params.id },
            });
        }

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                price,
                stock,
                category,
                details,
                ...(images && {
                    images: {
                        create: images.map(url => ({ url })),
                    },
                }),
            },
            include: {
                images: true,
                tent: true,
            },
        });

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (tent owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { tent: true },
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (existingProduct.tent.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this product' });
        }

        await prisma.product.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
