const mongoose = require('mongoose');

// Blog Schema
const feedBackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
    comments: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FeedBacks = mongoose.model('FeedBack', feedBackSchema);
module.exports = FeedBacks;
