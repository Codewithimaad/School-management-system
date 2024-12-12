const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    time: String,
    subject: String,
});

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    section: { type: String, default: "A" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    timetable: {
        type: Map,
        of: [timetableSchema], // A map of days to an array of timetable entries
    },
});



const Class = mongoose.model('Class', classSchema);
module.exports = Class;
