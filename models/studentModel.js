const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },
    phone: { type: String, required: true },
    address: { type: String },
    dob: { type: Date, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    roll_number: { type: String, required: true },
    stdClass: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }],
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    role: { type: String, default: 'student', required: true }, // Default role as 'student'

});

module.exports = mongoose.model('Student', studentSchema);
