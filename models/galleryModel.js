const mongoose = require('mongoose');

// Image Schema
const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
    content: {
        type: String, // Store content or description
        required: true,
    }
});

// Create the Image model
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
