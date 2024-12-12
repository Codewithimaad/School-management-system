const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Leave'], required: true },
    remarks: { type: String, default: 'N/A' },  // Field for remarks
});

module.exports = mongoose.model("Attendance", attendanceSchema);
