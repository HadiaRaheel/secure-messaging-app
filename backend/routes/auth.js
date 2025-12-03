// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Logger = require('../utils/Logger');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      await Logger.authFailed(username, 'Registration failed - username already exists', req.ip);
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      username,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log successful registration
    await Logger.log('AUTH_SUCCESS', user._id, username, 'User registered successfully', 'INFO');
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: user._id,
      username: user.username
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    await Logger.log('SERVER_ERROR', null, 'System', `Registration error: ${error.message}`, 'ERROR');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      await Logger.authFailed(username, 'Login failed - user not found', req.ip);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await Logger.authFailed(username, 'Login failed - incorrect password', req.ip);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Log successful login
    await Logger.authSuccess(user._id, username, 'User logged in successfully');
    
    res.json({
      message: 'Login successful',
      token,
      userId: user._id,
      username: user.username
    });
    
  } catch (error) {
    console.error('Login error:', error);
    await Logger.log('SERVER_ERROR', null, 'System', `Login error: ${error.message}`, 'ERROR');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token (optional - for checking if user is still authenticated)
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      valid: true,
      user: {
        userId: user._id,
        username: user.username
      }
    });
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;