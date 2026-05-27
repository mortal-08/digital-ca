const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ServiceRequest = require('../models/ServiceRequest');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a Stripe Payment Intent
// @route   POST /api/payments/create-intent/:requestId
router.post('/create-intent/:requestId', protect, async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        // Ensure user owns the request
        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const amount = request.amount > 0 ? request.amount * 100 : 50000; // Default to 500.00 if 0

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'inr',
            metadata: { requestId: request._id.toString() },
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Simulate/Mark payment as successful directly (Development/Demo only)
// @route   POST /api/payments/complete/:requestId
router.post('/complete/:requestId', protect, async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        request.paymentStatus = 'Paid';
        request.paymentId = 'simulated_' + Math.random().toString(36).substring(2, 9);
        await request.save();
        
        if (global.serverLog) {
            global.serverLog(`Payment Succeeded (Simulated) for request ${request._id}`);
        } else {
            console.log(`Payment Succeeded (Simulated) for request ${request._id}`);
        }
        
        res.json({ message: 'Payment successfully completed (simulated)', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Stripe Webhook Handler
// @route   POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const requestId = paymentIntent.metadata.requestId;

        await ServiceRequest.findByIdAndUpdate(requestId, {
            paymentStatus: 'Paid',
            paymentId: paymentIntent.id,
        });
        console.log(`Payment Succeeded for request ${requestId}`);
    }

    res.json({ received: true });
});

module.exports = router;
