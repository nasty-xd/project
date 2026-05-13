const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {

    try {

        const { username, password } = req.body;

        // проверка
        const existingUser =
            await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // hash
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // create
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.json({
            message: 'User created'
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// LOGIN
router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        const user =
            await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {
            return res.status(400).json({
                message: 'Wrong password'
            });
        }

        // token
        const token = jwt.sign(
            {
                userId: user._id
            },
            'secret123'
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;