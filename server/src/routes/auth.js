const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, UserRole } = require('../models');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty().withMessage('Имя обязательно')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const user = await User.create({ email, password, name });
    await UserRole.create({ userId: user.id, role: 'user' });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: ['user']
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: UserRole, as: 'roles' }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const isValid = await user.validatePassword(password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const token = generateToken(user.id);
    const roles = user.roles.map(r => r.role);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const roles = req.user.roles.map(r => r.role);
  
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      roles
    }
  });
});

// Update profile
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    if (name !== undefined) {
      req.user.name = name;
      await req.user.save();
    }

    const roles = req.user.roles.map(r => r.role);
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        roles
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal, but we can use this for logging)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
