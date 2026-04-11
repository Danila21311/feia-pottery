const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create order (available to authenticated or guest users)
router.post('/', [
  body('customerName').trim().notEmpty(),
  body('customerPhone').trim().notEmpty(),
  body('customerEmail').isEmail().normalizeEmail(),
  body('items').isArray({ min: 1 }),
  body('total').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerPhone, customerEmail, comment, items, total } = req.body;

    // Attach userId if authenticated
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.userId;
      } catch {
        // ignore invalid/expired tokens for guest checkout
      }
    }

    const order = await Order.create({
      userId,
      customerName,
      customerPhone,
      customerEmail,
      comment: comment || null,
      items,
      total,
      status: 'pending'
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get orders for current user
router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: get all orders
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update order status
router.put('/:id/status', authenticate, isAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
