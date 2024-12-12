const mongoose = require('mongoose');

// Define the Academics schema
const academicsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'], // Add a custom error message
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'], // Add a custom error message
        trim: true // Optional, to remove extra spaces at the start or end
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
        immutable: true // Prevent this field from being updated
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically update this field
    }
});

// Add a pre-save hook to update the `updatedAt` field
academicsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the Academics model
const Academics = mongoose.model('Academics', academicsSchema);

module.exports = Academics;
