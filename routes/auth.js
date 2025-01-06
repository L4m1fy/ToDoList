const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid login credentials');
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ requiresTwoFactor: true });
      }
      
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode
      });
      
      if (!verified) {
        throw new Error('Invalid 2FA code');
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Enable 2FA
router.post('/enable-2fa', auth, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret();
    req.user.twoFactorSecret = secret.base32;
    await req.user.save();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: 'ToDoList DC-Link',
      issuer: req.user.email
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    res.json({ secret: secret.base32, qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify and activate 2FA
router.post('/verify-2fa', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      throw new Error('Invalid verification code');
    }

    req.user.twoFactorEnabled = true;
    await req.user.save();
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update theme
router.post('/update-theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    req.user.theme = theme;
    await req.user.save();
    res.json({ message: 'Theme updated successfully', theme });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
