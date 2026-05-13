const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
    tag: String,
    desc: String,
    category: String,
    color: String,
    added: Date,
    lat: Number,
    lng: Number
});

const mapSchema = new mongoose.Schema({
    name: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    markers: [markerSchema]
});

module.exports = mongoose.model('Map', mapSchema);