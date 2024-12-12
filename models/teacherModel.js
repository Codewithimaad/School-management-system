const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    imageUrl: {
        type: String, // URL of the image uploaded to Cloudinary
        required: true,
    },
    salary: { type: Number, required: true },
    status: { type: String, required: true },
    description: { type: String },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    role: { type: String, default: 'teacher', required: true }, // Default role as 'teacher'

});

const teacherModel = mongoose.model('Teacher', teacherSchema);

module.exports = teacherModel;
