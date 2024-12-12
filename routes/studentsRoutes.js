const express = require('express');
const router = express.Router();
const teacherModel = require('../models/teacherModel');
const studentModel = require('../models/studentModel');
const classModel = require('../models/classModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');



router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Route to get students add Page
router.get('/dashboard/student/add', authenticateUser, checkRole('admin', 'teacher'), async (req, res) => {
    try {
        const classes = await classModel.find();
        res.render("dashboard/studentpages/studenthome", {
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

// Route to Create Students
router.post(
    '/dashboard/student/add',
    authenticateUser,
    checkRole('admin', 'teacher'),
    [
        // Validation rules
        body('name').notEmpty().withMessage('Name is required.'),
        body('fname').notEmpty().withMessage('Father\'s name is required.'),
        body('dob').notEmpty().withMessage('Date of birth is required.').isDate().withMessage('Invalid date format.'),
        body('phone')
            .notEmpty().withMessage('Phone number is required.')
            .isMobilePhone().withMessage('Invalid phone number.'),
        body('email')
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Invalid email format.')
            .custom(async (email) => {
                // Check if email already exists
                const student = await studentModel.findOne({ email });
                if (student) {
                    throw new Error('Email is already in use.');
                }
                return true;
            }),
        body('address').notEmpty().withMessage('Address is required.'),
        body('password')
            .notEmpty().withMessage('Password is required.')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
        body('enrollmentDate')
            .optional()
            .isDate().withMessage('Invalid enrollment date format.'),
        body('roll_number')
            .notEmpty().withMessage('Roll number is required.')
            .isAlphanumeric().withMessage('Roll number must be alphanumeric.'),
        body('stdClass')
            .notEmpty().withMessage('Class is required.')
            .isMongoId().withMessage('Invalid class ID.'),
        body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender selected.'),
    ],
    async (req, res) => {
        // Capture validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are validation errors, send them back as flash messages
            req.flash('error_msg', errors.array().map(error => error.msg).join(', '));
            return res.redirect('/dashboard/student/add'); // Redirect back to the form
        }

        let { name, fname, dob, phone, email, address, password, enrollmentDate, roll_number, stdClass, gender } = req.body;

        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

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
    let { name, fname, dob, phone, address, enrollmentDate, roll_number, stdClass, gender } = req.body;

    try {
        // Update student details including the gender field
        const updatedStudent = await studentModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                name,
                fname,
                dob,
                phone,
                address,
                enrollmentDate,
                roll_number,
                stdClass,
                gender  // Update gender here
            },
            { new: true } // Return the updated document
        );

        if (!updatedStudent) {
            req.flash('error_msg', 'Student not found.');
        }

        req.flash('success_msg', 'Student Updated successfully.');
        res.redirect('/dashboard/student/reports');
    } catch (error) {
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
