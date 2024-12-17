const mongoose = require('mongoose');

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Blogs = mongoose.model('Blogs', blogSchema);
module.exports = Blogs;
