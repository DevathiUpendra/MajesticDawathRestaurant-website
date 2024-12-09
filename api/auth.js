// server/api/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Default role to 'customer' if not provided
        const userRole = role || 'customer';

        // Check if username already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user in the database
        const userId = await User.create(username, hashedPassword, userRole);

        res.status(201).json({ message: 'User registered successfully', userId, role: userRole });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Respond with user details on successful login
        res.json({ message: 'Login successful', userId: user.id, role: user.role });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
});

module.exports = router;
