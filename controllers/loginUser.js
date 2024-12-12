const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user;


        // Authenticate based on the selected role
        if (role === 'admin') {
            user = await Admin.findOne({ email });
        } else if (role === 'teacher') {
            user = await Teacher.findOne({ email });
        } else if (role === 'student') {
            user = await Student.findOne({ email });
        } else {
            req.flash('error_msg', 'Invalid role selected.');
            return res.redirect('/login'); // Redirect to login page if no role is selected
        }

        if (!user) {
            req.flash('error_msg', 'Invalid Email or Password.');
            return res.redirect('/login'); // Redirect to login page if no user found
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid credentials.');
            return res.redirect('/login'); // Redirect to login page if password doesn't match
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set the token in cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,  // 1 hour
        });

        // Redirect based on user role
        if (user.role === 'admin') {
            return res.redirect('/dashboard'); // Redirect to admin dashboard
        } else if (user.role === 'teacher') {
            return res.redirect('/dashboard/profile'); // Redirect to teacher dashboard
        } else if (user.role === 'student') {
            return res.redirect('/dashboard/profile'); // Redirect to student dashboard
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        req.flash('error_msg', 'Something went wrong. Please try again later.');
        return res.redirect('/login'); // Redirect to login page on error
    }
};

module.exports = loginUser;
