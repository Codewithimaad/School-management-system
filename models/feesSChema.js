const mongoose = require('mongoose');
const { Schema } = mongoose;

// Fee Schema
const feeAmountSchema = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class', // Assuming the Class model exists
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student', // Assuming the Student model exists
        required: true
    },
    category: {
        type: String,
        enum: ['Tuition', 'Transport', 'Miscellaneous'], // You can add more categories
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Pending'],
        default: 'Unpaid'
    },
    paymentDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update `updatedAt` on save
feeAmountSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Fee = mongoose.model('FeeAmount', feeAmountSchema);
module.exports = Fee;
