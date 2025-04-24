const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); // Import the admin middleware

// Register
router.post('/register', async (req, res) => {
    const { fullName, username, email, password, isAdmin } = req.body;

    console.log('Register request body:', req.body); // Debugging

    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'Username already exists' });

        user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email already exists' });

        user = new User({
            fullName,
            username,
            email,
            password: await bcrypt.hash(password, 10),
            isAdmin: isAdmin || false // Allow setting isAdmin during registration (for testing)
        });

        await user.save();

        console.log('Saved user:', user); // Debugging

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    const { fullName, username, email } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) return res.status(400).json({ msg: 'Username already taken' });
        }
        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ msg: 'Email already taken' });
        }

        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.email = email || user.email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Admin: Get all users
router.get('/users', auth, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Admin: Delete a user
router.delete('/users/:id', auth, admin, async (req, res) => {
    try {
        console.log('Deleting user with ID:', req.params.id);
        const user = await User.findById(req.params.id);
        if (!user) {
            console.log('User not found for ID:', req.params.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent admin from deleting themselves
        console.log('Current user ID:', req.user.id, 'Target user ID:', user.id);
        if (user.id === req.user.id) {
            return res.status(400).json({ msg: 'Cannot delete your own account' });
        }

        await User.deleteOne({ _id: req.params.id });
        console.log('User deleted successfully:', req.params.id);
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE /users/:id:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;