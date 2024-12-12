const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/dashboard/profile', authenticateUser, checkRole('admin', 'teacher', 'student'), async (req, res) => {
    try {
        const userId = req.user._id;

        // Search user in models
        let user = await Admin.findById(userId).lean();
        let userType = 'admin';

        if (!user) {
            user = await Teacher.findById(userId).populate('classes').lean();
            userType = 'teacher';
        }

        if (!user) {
            user = await Student.findById(userId).populate('stdClass').lean();
            userType = 'student';
        }

        // Handle case where no user is found
        if (!user) {
            return res.status(404).render('error', {
                message: 'User not found. Please check your login credentials.',
            });
        }

        // Convert image to Base64 for display if it exists
        if (user.image) {
            user.image = user.image.toString('base64');
        }

        // Render the profile page
        res.render('dashboard/profile', {
            user,
            userType, // Pass the user type for role-specific UI
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (err) {

        // Generic error handling
        res.status(500).render('pages/error', {
            message: 'An unexpected error occurred while loading the profile.',
        });
    }
});


module.exports = router;
