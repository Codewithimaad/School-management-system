const mongoose = require('mongoose');

const principalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
});

const Principal = mongoose.model('Principal', principalSchema);

module.exports = Principal;
