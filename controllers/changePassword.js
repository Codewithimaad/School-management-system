const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user._id; // Extracted from JWT authentication middleware

        // Validate input
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            req.flash('error_msg', 'All fields are required.');
            return res.redirect('/dashboard/profile');
        }

        if (newPassword !== confirmNewPassword) {
            req.flash('error_msg', 'New passwords do not match.');
            return res.redirect('/dashboard/profile');
        }

        // Find user based on their role
        let user;
        let userType;
        if (req.user.role === 'admin') {
            user = await Admin.findById(userId);
            userType = 'admin';
        } else if (req.user.role === 'teacher') {
            user = await Teacher.findById(userId);
            userType = 'teacher';
        } else if (req.user.role === 'student') {
            user = await Student.findById(userId);
            userType = 'student';
        }

        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/dashboard/profile');
        }

        // Check if old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Old password is incorrect.');
            return res.redirect('/dashboard/profile');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        req.flash('success_msg', 'Password changed successfully!');
        res.redirect('/dashboard/profile');
    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/profile');
    }
};

module.exports = changePassword;
