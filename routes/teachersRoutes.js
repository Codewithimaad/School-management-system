// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const teacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const adminModel = require('../models/adminModel');
const studentModel = require('../models/studentModel');
const Principal = require('../models/principalModel');
const { body, validationResult } = require('express-validator');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');




router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Define routes for dashboard pages
router.get('/dashboard', authenticateUser, checkRole('admin', 'teacher', 'student'), async (req, res) => {
    let profile = await adminModel.findOne({ _id: req.user._id }) ||
        await teacherModel.findOne({ _id: req.user._id }) ||
        await studentModel.findOne({ _id: req.user._id });

    if (!profile) {
        req.flash('error_msg', 'No profile found!');
        return res.redirect('/login');
    }

    res.render("dashboard/dashboardhome", {
        profile,
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg'), // Pass success flash message
    });
});


// Routes for Teacher Add
router.get('/dashboard/teacher/add', authenticateUser, checkRole('admin'), (req, res) => {
    res.render("dashboard/teacherpages/teacher", {
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
});

// Add Teacher Route
router.post(
    '/dashboard/teacher/add',
    authenticateUser,
    checkRole('admin'),
    upload.single('image'),

    async (req, res) => {

        const { name, subject, salary, qualification, email, phone, password, status, description } = req.body;
        const localFilePath = req.file.path;

        try {

            // Upload image to Cloudinary
            const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

            if (!cloudinaryResponse) {
                return req.flash('success_msg', 'Failed to upload image.');

            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new teacher
            const newTeacher = new teacherModel({
                name,
                subject,
                email,
                phone,
                password: hashedPassword,
                salary,
                status,
                qualification,
                description,
                imageUrl: cloudinaryResponse.url,
                role: 'teacher', // Add role for role-based authorization
            });

            await newTeacher.save();

            // Flash success message
            req.flash('success_msg', 'Teacher added successfully!');
            res.redirect('/dashboard/teacher/reports'); // Or the correct redirection URL
        } catch (error) {
            // Flash error message
            req.flash('error_msg', 'Something went wrong while adding the teacher.');
            res.redirect('/dashboard/teacher/add');
        }
    }
);



// Protected Teacher route that only allows users with a "teacher" role
router.get('/dashboard/teacher/reports', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Get all teachers from the database
        let teachers = await teacherModel.find();



        // Get the count of total, active, and teachers on leave
        const totalTeachers = teachers.length;
        const activeTeachers = teachers.filter(t => t.status === 'Active').length;
        const teachersOnLeave = totalTeachers - activeTeachers;

        // Render the report page with teacher data
        res.render("dashboard/teacherpages/teacherreports", {
            teachers,
            totalTeachers,
            activeTeachers,
            teachersOnLeave,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Server Error.');
        res.redirect('/dashboard')

    }
});

// Route to get teacher Detail page
router.get("/dashboard/teacher/:id", authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Find the teacher by _id (which is stored in req.params.id)
        let teacher = await teacherModel.findById(req.params.id);

        // Check if the teacher is not found
        if (!teacher) {
            req.flash('error_msg', 'Teacher not found.');
            return res.redirect('/dashboard/teacher/reports')
        }



        // Render the edit view with teacher data
        res.render("dashboard/teacherpages/teacherDetailsView", { teacher });
    } catch (error) {
        req.flash('error_msg', 'Server Error.');
        res.redirect('/dashboard/teacher/reports')
    }
});


// Route to delete teacher

router.get('/dashboard/teacher/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const teacherId = req.params.id;
        await teacherModel.findByIdAndDelete(teacherId); // Deletes the teacher from the database
        req.flash('success_msg', 'Teacher Deleted Successfully.');
        res.redirect('/dashboard/teacher/reports'); // Redirect to the reports page after deletion
    } catch (error) {
        req.flash('error_msg', 'Failed to delete teacher.');
        res.redirect('/dashboard/teacher/reports'); // Redirect back if there's an error
    }
});


router.get('/dashboard/teacher/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const teachers = await teacherModel.findById(req.params.id);

        if (!teachers) {
            req.flash('error_msg', 'Teacher not found.');
            return res.redirect('/dashboard/teacher/reports');

        }



        res.render('dashboard/teacherpages/teacherEdit', { teachers });
    } catch (error) {
        req.flash('error_msg', 'Error fetching teacher for edit.');
        res.redirect('/dashboard/teacher/reports')
    }
});




router.post('/dashboard/teacher/edit/:id',
    authenticateUser,
    checkRole('admin'),
    upload.single('image'),
    async (req, res) => {
        const { name, subject, salary, email, qualification, phone, password, status, description } = req.body;
        let imageUrl = null;

        try {
            // Check if a new image is uploaded
            if (req.file) {
                const localFilePath = req.file.path;

                // Upload image to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

                if (!cloudinaryResponse) {
                    req.flash('error_msg', 'Failed to upload image.');
                    return res.redirect(`/dashboard/teacher/edit/${req.params.id}`);
                }

                imageUrl = cloudinaryResponse.url;
            }

            // Prepare update data
            const updateData = {
                name,
                subject,
                email,
                qualification,
                phone,
                password,
                status,
                salary,
                description,
                ...(imageUrl && { imageUrl }), // Include imageUrl only if it exists
            };

            // Update the teacher details
            const updatedTeacher = await teacherModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedTeacher) {
                req.flash('error_msg', 'Teacher not found.');
                return res.redirect(`/dashboard/teacher/edit/${req.params.id}`);
            }

            req.flash('success_msg', 'Teacher updated successfully!');
            res.redirect('/dashboard/teacher/reports');
        } catch (error) {
            console.error(error); // Log the error for debugging
            req.flash('error_msg', 'Failed to update teacher details.');
            res.redirect(`/dashboard/teacher/edit/${req.params.id}`);
        }
    }
);














module.exports = router;
