const express = require('express');
const { body, validationResult } = require('express-validator');
const { Workshop } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all workshops (public)
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.findAll({
      order: [['date', 'ASC']]
    });
    res.json(workshops);
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single workshop (public)
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    
    res.json(workshop);
  } catch (error) {
    console.error('Get workshop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create workshop (admin only)
router.post('/', authenticate, isAdmin, [
  body('id').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('date').notEmpty(),
  body('time').notEmpty(),
  body('duration').notEmpty(),
  body('format').notEmpty(),
  body('price').isInt({ min: 0 }),
  body('maxParticipants').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const existingWorkshop = await Workshop.findByPk(req.body.id);
    if (existingWorkshop) {
      return res.status(400).json({ error: 'Workshop with this ID already exists' });
    }
    
    const workshop = await Workshop.create(req.body);
    res.status(201).json(workshop);
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update workshop (admin only)
router.put('/:id', authenticate, isAdmin, [
  body('title').optional().notEmpty().trim(),
  body('price').optional().isInt({ min: 0 }),
  body('maxParticipants').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const workshop = await Workshop.findByPk(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    
    await workshop.update(req.body);
    res.json(workshop);
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workshop (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    
    await workshop.destroy();
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
