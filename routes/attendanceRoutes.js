const express = require('express');
const router = express.Router();
const classModel = require('../models/classModel');  // Your Class model
const studentModel = require('../models/studentModel');  // Student model
const attendanceModel = require('../models/attendanceModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// GET route to render the attendance page
router.get('/dashboard/attendance/mark', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    const { date, stdClass } = req.query;
    const searchQuery = {};

    if (stdClass) {
        searchQuery.stdClass = stdClass;
    }

    let students = [];
    try {
        if (date && stdClass) {
            // Only fetch students of the selected class
            students = await studentModel.find(searchQuery).populate('stdClass');
        }

        const classes = await classModel.find();

        res.render('dashboard/attendance/attendanceForm', {
            students,
            classes,
            searchQuery: { date, stdClass },
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (err) {
        req.flash('error_msg', 'Unable to fetch students.');
        res.redirect('/dashboard/attendance/mark');
    }
});



// POST route to save attendance
router.post('/dashboard/attendance/save', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    const { attendance, classId, date } = req.body;

    try {
        for (const studentId in attendance) {
            const { status, remarks } = attendance[studentId];

            // Save or update attendance for the selected date
            const existingRecord = await attendanceModel.findOne({
                studentId,
                classId,
                date: new Date(date),
            });

            if (existingRecord) {
                existingRecord.status = status;
                existingRecord.remarks = remarks || '';
                await existingRecord.save();
            } else {
                const newAttendance = new attendanceModel({
                    studentId,
                    classId,
                    status,
                    remarks: remarks || '',
                    date: new Date(date),
                });
                await newAttendance.save();
            }
        }

        req.flash('success_msg', 'Attendance successfully recorded.');
        res.redirect('/dashboard/attendance/mark');
    } catch (err) {
        req.flash('error_msg', 'Failed to save attendance.');
        res.redirect('/dashboard/attendance/mark');
    }
});




// GET route to render the attendance report of students
router.get('/dashboard/attendance/reports', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    const { stdClass, name, roll_number, startDate, endDate } = req.query;
    const searchQuery = {};
    const dateRangeQuery = {};

    // Search by class
    if (stdClass) {
        searchQuery.stdClass = { $in: [stdClass] }; // Use $in for an array of ObjectIds
    }

    // Search by student name or roll number
    if (name) {
        searchQuery.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (roll_number) {
        searchQuery.roll_number = roll_number; // Assuming the roll number field exists in the student model
    }

    // Date range filter for attendance records
    if (startDate && endDate) {
        dateRangeQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    try {
        // Initialize students as an empty array (students will be fetched only if the search is performed)
        let students = [];

        // Fetch students only if there's any search query (i.e., stdClass, name, roll_number, or date range)
        if (stdClass || name || roll_number || startDate || endDate) {
            students = await studentModel.find(searchQuery);
        }

        // If no students match the query, skip fetching attendance records and render an empty list
        if (students.length === 0) {
            return res.render('dashboard/attendance/attendanceReports', {
                students: [],
                attendanceData: [],
                classes: await classModel.find(),
                searchQuery: { stdClass, name, roll_number, startDate, endDate },
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg'),
            });
        }

        // Fetch attendance records based on the search query and date range
        const attendanceRecords = await attendanceModel.find({
            ...dateRangeQuery,
            studentId: { $in: students.map(student => student._id) }, // Match studentIds of the filtered students
        }).populate('studentId classId');

        // Filter out students with no attendance records
        const filteredStudents = students.filter(student =>
            attendanceRecords.some(att => att.studentId._id.toString() === student._id.toString())
        );

        // Format data for yearly report
        const attendanceData = filteredStudents.map(student => {
            const studentAttendance = attendanceRecords.filter(att => att.studentId._id.toString() === student._id.toString());
            const yearlyAttendance = {}; // To store attendance for each year (e.g., "2024")

            studentAttendance.forEach(att => {
                const year = att.date.getFullYear(); // Extract the year (e.g., "2024")

                // Initialize the year entry if it doesn't exist
                if (!yearlyAttendance[year]) {
                    yearlyAttendance[year] = { Present: 0, Absent: 0, Late: 0, Leave: 0 };
                }

                // Increment the appropriate status for the year
                yearlyAttendance[year][att.status]++;
            });

            return { student, yearlyAttendance };
        });

        // Render the page with filtered data
        res.render('dashboard/attendance/attendanceReports', {
            students: filteredStudents,
            attendanceData,
            classes: await classModel.find(),
            searchQuery: { stdClass, name, roll_number, startDate, endDate },
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (err) {
        req.flash('error_msg', 'Failed to fetch attendance report.');
        res.redirect('/dashboard/attendance/reports');
    }
});





// Route for admins and teachers to view a student's attendance and filter by date
router.get('/dashboard/attendance/view/:studentId', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    const { studentId } = req.params;  // Student ID from URL parameter
    const { fromDate, toDate } = req.query;  // Date range filter from query params

    try {
        // Fetch the student details
        const student = await studentModel.findById(studentId).populate('stdClass');

        if (!student) {
            req.flash('error_msg', 'Student not found');
            return res.redirect('/dashboard/attendance/reports');
        }

        // Build the attendance query with optional date filters
        let query = { studentId: studentId };

        // Apply date filters only if provided
        if (fromDate) {
            query.date = { $gte: new Date(fromDate) };  // Filter from the start date
        }
        if (toDate) {
            query.date = { ...query.date, $lte: new Date(toDate) };  // Filter up to the end date
        }

        // Fetch the filtered attendance records
        const attendanceRecords = await attendanceModel.find(query).populate('classId');

        // Calculate summary stats
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(att => att.status === 'Present').length;
        const absentDays = attendanceRecords.filter(att => att.status === 'Absent').length;
        const lateDays = attendanceRecords.filter(att => att.status === 'Late').length;
        const leaveDays = attendanceRecords.filter(att => att.status === 'Leave').length;
        const attendancePercentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        // Send data to the view
        res.render('dashboard/attendance/studentAttendanceDetails', {
            student,
            attendanceRecords,
            presentDays,
            absentDays,
            lateDays,
            leaveDays,
            totalDays,
            attendancePercentage,
            searchQuery: { fromDate, toDate },
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });

    } catch (err) {
        req.flash('error_msg', 'Failed to fetch attendance details.');
        res.redirect('/dashboard/attendance/reports');
    }
});











// Route to check attendance only for specific student
router.get('/dashboard/attendance/checkattendance', authenticateUser, checkRole('student'), async (req, res) => {
    let studentId = req.user._id; // Assuming you store the user ID in the session (req.user._id)


    // Ensure the studentId is in the correct format
    if (!studentId) {
        req.flash('error_msg', 'Student not found');
        return res.redirect('/dashboard/attendance/reports');
    }

    const { fromDate, toDate } = req.query;


    try {
        // Fetch the student details based on the studentId from the logged-in user
        const student = await studentModel.findById(studentId);

        // Check if student exists
        if (!student) {
            req.flash('error_msg', 'Student not found');
            return res.redirect('/dashboard/attendance/reports');
        }

        // Build the query for attendance based on date filters
        const query = { studentId: studentId };

        // Apply date filters only if provided
        if (fromDate || toDate) {
            query.date = {}; // Initialize the date filter object
            if (fromDate) {
                query.date.$gte = new Date(fromDate).setHours(0, 0, 0, 0);  // Start of the day
            }
            if (toDate) {
                query.date.$lte = new Date(toDate).setHours(23, 59, 59, 999);  // End of the day
            }
        }


        // Fetch the filtered attendance records for the logged-in student
        const attendanceRecords = await attendanceModel.find(query).populate('classId');

        // Calculate attendance summary stats
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(att => att.status === 'Present').length;
        const absentDays = attendanceRecords.filter(att => att.status === 'Absent').length;
        const lateDays = attendanceRecords.filter(att => att.status === 'Late').length;
        const leaveDays = attendanceRecords.filter(att => att.status === 'Leave').length;
        const attendancePercentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        // Render the attendance details page for the student
        res.render('dashboard/attendance/checkAttendance', {
            student,
            attendanceRecords,
            presentDays,
            absentDays,
            lateDays,
            leaveDays,
            totalDays,
            attendancePercentage,
            searchQuery: { fromDate, toDate },
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Failed to fetch attendance details.');
        res.redirect('/dashboard/attendance/reports');
    }
});







module.exports = router;
