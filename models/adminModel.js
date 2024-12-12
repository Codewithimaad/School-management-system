const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
    description: { type: String },
    phone: { type: String, required: true },
    role: { type: String, default: 'admin', required: true }, // Default role as 'student'
    lastLogin: { type: Date, default: null }, // Store last login date


}, {
    timestamps: true
});

// Create the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;