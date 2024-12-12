// models/announcementModel.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    audience: {
        type: String,
        enum: ['admin', 'teachers', 'students', 'class', 'all'],
        required: true,
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: function () {
            return this.audience === 'class'; // Only required if audience is 'class'
        },
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
