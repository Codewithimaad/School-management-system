const express = require('express');
const router = express.Router();
const teacherModel = require('../models/teacherModel');
const studentModel = require('../models/studentModel');
const classModel = require('../models/classModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const Fee = require('../models/feesSChema');
const { getStudentFee, printFee } = require('../controllers/studentCheckFeeController');



router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Route to get students add Page
router.get('/dashboard/student/add', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    try {
        const classes = await classModel.find();
        res.render("dashboard/studentPages/studenthome", {
            classes,
            students: {}, // Pass an empty student object
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')     // Pass error flash message
        });
    } catch (err) {
        req.flash('error_msg', 'Failed to load classes. Please try again.');
        res.redirect('/dashboard/student/reports'); // Redirect on error
    }
});


// Route for Student to check there fee details
router.get('/dashboard/check-fee', authenticateUser, checkRole('student'), getStudentFee);

router.get('/dashboard/print-fee/:id', authenticateUser, checkRole("student"), printFee);

// Route to Create Students
router.post(
    '/dashboard/student/add',
    authenticateUser,
    checkRole('admin', 'teacher'),

    async (req, res) => {

        let { name, fname, dob, phone, email, address, password, enrollmentDate, roll_number, stdClass, gender, resgistrationNo } = req.body;

        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const isExistRegsitrationNo = await studentModel.findOne({ resgistrationNo });

            if (isExistRegsitrationNo) {
                req.flash('error_msg', 'Student with the same registration number already Exist.')
                return res.redirect('/dashboard/student/add');

            }

            // Create the new student
            const newStudent = await studentModel.create({
                name,
                fname,
                dob,
                phone,
                address,
                email,
                password: hashedPassword,
                enrollmentDate: enrollmentDate || Date.now(),
                roll_number,
                stdClass,
                gender,
                resgistrationNo,
                role: 'student'
            });

            // Update the class with the new student's ID
            await classModel.updateMany(
                { _id: { $in: stdClass } },
                { $push: { students: newStudent._id } }
            );

            req.flash('success_msg', 'Student added successfully!');
            if (req.user.role === 'admin') {
                return res.redirect("/dashboard/student/reports");
            } else {
                return res.redirect("/dashboard");
            }
        } catch (err) {
            req.flash('error_msg', 'Error adding the student. Please try again.');
            res.redirect('/dashboard/student/add');
        }
    }
);

// Route for Student Reports
router.get('/dashboard/student/reports', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { search, stdClass } = req.query;
    const searchQuery = {};

    if (search) {
        searchQuery.name = { $regex: search, $options: 'i' }; // Search by name (case insensitive)
    }
    if (stdClass) {
        searchQuery.stdClass = stdClass; // Search by class
    }

    try {
        // Fetch students based on the search query
        const students = await studentModel.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .populate('stdClass');



        // Get the total number of students matching the search query
        const totalStudents = await studentModel.countDocuments(searchQuery);

        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalStudents / limit);



        // Pass data to the view, including flash messages
        res.render('dashboard/studentPages/studentReports', {
            students,
            totalStudents,
            currentPage: page,
            totalPages,
            searchQuery: { search, stdClass },
            classes: await classModel.find(),
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (err) {

        // Error flash message
        req.flash('error_msg', 'Failed to load student reports.');
        res.redirect('/dashboard/student/reports');
    }
});

router.get('/dashboard/student/edit/:id', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    try {
        const students = await studentModel
            .findOne({ _id: req.params.id }).populate("stdClass"); // This should ensure the student's class is populated
        const classes = await classModel.find();

        if (!students) {
            req.flash('error_msg', 'Student not found.');
            return res.redirect('/dashboard/students');
        }



        res.render('dashboard/studentPages/editStudent', {
            students,
            classes,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading student details.');
        res.redirect('/dashboard/students');
    }
});





// POST route to edit student details
router.post('/dashboard/student/edit/:id', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    let { name, fname, dob, phone, address, enrollmentDate, roll_number, stdClass, gender, resgistrationNo } = req.body;
    const studentId = req.params.id; // ✅ Define studentId properly

    // 🛑 Validate required fields
    if (!resgistrationNo || resgistrationNo.trim() === '') {
        req.flash('error_msg', 'Registration number is required.');
        return res.redirect(`/dashboard/student/edit/${studentId}`);
    }

    try {
        const student = await studentModel.findById(studentId);
        if (!student) {
            req.flash('error_msg', 'Student not found.');
            return res.redirect('/dashboard/student/reports');
        }

        // 🛑 Check for duplicate registration number (excluding current student)
        const isExistRegistrationNo = await studentModel.findOne({
            resgistrationNo,
            _id: { $ne: studentId }
        });

        if (isExistRegistrationNo) {
            req.flash('error_msg', 'A student with the same registration number already exists.');
            return res.redirect(`/dashboard/student/edit/${studentId}`);
        }

        // 🛑 Check for duplicate roll number (excluding current student)
        const existRollNo = await studentModel.findOne({
            roll_number,
            _id: { $ne: studentId }
        });

        if (existRollNo) {
            req.flash('error_msg', 'A student with the same roll number already exists.');
            return res.redirect(`/dashboard/student/edit/${studentId}`);
        }

        // ✅ If class is changed, remove the student from the old class (if exists)
        if (student.stdClass && student.stdClass.toString() !== stdClass) {
            await classModel.findByIdAndUpdate(student.stdClass, { $pull: { students: student._id } });
        }

        // ✅ Update student details
        student.name = name;
        student.fname = fname;
        student.dob = dob;
        student.phone = phone;
        student.address = address;
        student.enrollmentDate = enrollmentDate;
        student.roll_number = roll_number;
        student.stdClass = stdClass;
        student.resgistrationNo = resgistrationNo.trim();
        student.gender = gender;

        await student.save(); // Save updated student data

        // ✅ Add the student to the new class
        if (stdClass) {
            await classModel.findByIdAndUpdate(stdClass, { $addToSet: { students: student._id } });
        }

        // ✅ Update fees to reflect the new class
        await Fee.updateMany({ studentId: student._id }, { classId: stdClass });

        req.flash('success_msg', 'Student Updated successfully.');
        res.redirect('/dashboard/student/reports');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating student.');
        res.redirect('/dashboard/student/reports');
    }
});






// Route to delete student
router.post('/dashboard/student/delete/:id', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    try {
        const deleteStudent = await studentModel.findOneAndDelete({ _id: req.params.id });
        if (deleteStudent) {
            req.flash('success_msg', 'Student Deleted Successfully.');
            res.redirect('/dashboard/student/reports');
        } else {
            req.flash('error_msg', 'Student not found.');
            res.redirect('/dashboard/student/reports');
        }
    } catch (err) {
        req.flash('error_msg', 'Failed to delete student.');
        res.redirect('/dashboard/student/reports');
    }
});



// Route for specific student details
router.get('/dashboard/student/details/:id', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    try {
        const student = await studentModel.findOne({ _id: req.params.id }).populate('stdClass');
        res.render('dashboard/studentPages/studentDetails', {
            student,
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        },

        );
    } catch (err) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/student/reports');
    }
});







module.exports = router;
