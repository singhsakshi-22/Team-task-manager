const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_aether_productivity';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// Generate Token Utility
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

// Gradients array for avatars
const AVATAR_GRADIENTS = [
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-red-500',
  'from-amber-500 to-orange-500'
];

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already registered with this email' });
    }

    // Choose random gradient
    const avatarColor = AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];

    let passwordHash = password;
    if (User.hashPassword) {
      // Mock db custom password hashing
      passwordHash = await User.hashPassword(password);
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: role || 'Member',
      avatarColor
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const queryResult = await User.find({ email });
    const user = queryResult[0]; // In our mock find returns an array, or standard mongoose too if used via find
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    let isMatch = false;
    if (User.comparePassword) {
      isMatch = await User.comparePassword(password, user.password);
    } else {
      // mongoose instance method
      const userInstance = await User.findById(user._id).select('+password');
      isMatch = await userInstance.matchPassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get logged in user details
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarColor: req.user.avatarColor
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.avatarColor = req.body.avatarColor || user.avatarColor;

    if (req.body.password) {
      if (User.hashPassword) {
        user.password = await User.hashPassword(req.body.password);
      } else {
        user.password = req.body.password; // Mongoose middleware will hash
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all users for project/task assignment
// @route   GET /api/auth/users
// @access  Private
router.get('/users', protect, async (req, res, next) => {
  try {
    const users = await User.find({});
    // Remove sensitive data before returning
    const safeUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor
    }));

    res.status(200).json({
      success: true,
      users: safeUsers
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
