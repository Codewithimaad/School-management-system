const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let errors = {}; // Store error messages
        let user;

        // Basic input validation
        if (!email) {
            errors.email = 'Email is required.';
        }
        if (!password) {
            errors.password = 'Password is required.';
        }
        if (!role) {
            errors.role = 'Please select a role.';
        } else if (!['admin', 'teacher', 'student'].includes(role)) {
            errors.role = 'Invalid role selected.';
        }

        // If any input validation errors exist, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Find the user across all roles
        const adminUser = await Admin.findOne({ email });
        const teacherUser = await Teacher.findOne({ email });
        const studentUser = await Student.findOne({ email });

        // Determine which user exists
        if (adminUser) {
            user = { data: adminUser, role: 'admin' };
        } else if (teacherUser) {
            user = { data: teacherUser, role: 'teacher' };
        } else if (studentUser) {
            user = { data: studentUser, role: 'student' };
        }

        // Check if user exists
        if (!user) {
            return res.status(400).json({ success: false, errors: { email: 'Invalid email. Please check your credentials.' } });
        }

        // Check if the selected role matches the user's actual role
        if (user.role !== role) {
            return res.status(400).json({ success: false, errors: { role: 'Incorrect role selected. Please select the correct role.' } });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.data.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, errors: { password: 'Incorrect password. Please enter a valid password.' } });
        }

        // Generate JWT token if authentication is successful
        const token = jwt.sign(
            { id: user.data._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set the token in cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });

        // Return success response with redirect URL
        return res.json({
            success: true,
            redirectUrl: role === 'admin' ? '/dashboard/home' : '/dashboard/profile'
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, error: 'Something went wrong. Please try again later.' });
    }
};

module.exports = loginUser;
