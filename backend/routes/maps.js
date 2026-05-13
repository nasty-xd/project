const express = require('express');
const jwt = require('jsonwebtoken');
const Map = require('../models/Map');

const router = express.Router();

function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }

    try {
        const decoded = jwt.verify(token, 'secret123');
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}

// получить только карты текущего пользователя
router.get('/', auth, async (req, res) => {
    const maps = await Map.find({ owner: req.userId });
    res.json(maps);
});

// создать карту
router.post('/', auth, async (req, res) => {
    const map = new Map({
        name: req.body.name,
        owner: req.userId,
        markers: []
    });

    await map.save();

    res.json(map);
});

// удалить карту
router.delete('/:id', auth, async (req, res) => {
    await Map.deleteOne({
        _id: req.params.id,
        owner: req.userId
    });

    res.json({ message: 'Map deleted' });
});

// переименовать
router.put('/:id', auth, async (req, res) => {
    const map = await Map.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.userId
        },
        {
            name: req.body.name,
            markers: req.body.markers
        },
        { new: true }
    );

    res.json(map);
});


router.get('/:id', auth, async (req, res) => {
    const map = await Map.findOne({
        _id: req.params.id,
        owner: req.userId
    });

    if (!map) {
        return res.status(404).json({ message: 'Map not found' });
    }

    res.json(map);
});

module.exports = router;