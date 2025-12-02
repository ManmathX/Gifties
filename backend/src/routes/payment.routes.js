import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for Stripe
router.post('/create-intent', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(order.totalAmount) * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                orderId: order.id,
                userId: req.user.id,
            },
        });

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                amount: order.totalAmount,
                currency: 'USD',
                status: 'PENDING',
                provider: 'STRIPE',
                transactionId: paymentIntent.id,
                orderId: order.id,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id,
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Confirm payment
router.post('/confirm', authenticateToken, async (req, res) => {
    try {
        const { paymentId, paymentIntentId } = req.body;

        // Verify payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update payment status
            const payment = await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'COMPLETED',
                },
            });

            // Update order status
            await prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: 'PAID',
                },
            });

            res.json({ success: true, payment });
        } else {
            res.status(400).json({ error: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// Create Cash on Delivery payment
router.post('/cod', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Create COD payment record
        const payment = await prisma.payment.create({
            data: {
                amount: order.totalAmount,
                currency: 'USD',
                status: 'PENDING',
                provider: 'CASH_ON_DELIVERY',
                orderId: order.id,
            },
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
            },
        });

        res.json({ success: true, payment });
    } catch (error) {
        console.error('COD payment error:', error);
        res.status(500).json({ error: 'Failed to create COD payment' });
    }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // Update payment and order status
            const payment = await prisma.payment.findFirst({
                where: { transactionId: paymentIntent.id },
            });

            if (payment) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'COMPLETED' },
                });

                await prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'PAID' },
                });
            }
            break;

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;

            const failedPayment = await prisma.payment.findFirst({
                where: { transactionId: failedIntent.id },
            });

            if (failedPayment) {
                await prisma.payment.update({
                    where: { id: failedPayment.id },
                    data: { status: 'FAILED' },
                });

                await prisma.order.update({
                    where: { id: failedPayment.orderId },
                    data: { status: 'CANCELLED' },
                });
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

export default router;
