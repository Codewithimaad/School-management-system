const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token;  // Get the token from cookies

    if (!token) {
        return res.redirect('/login'); // If there's no token, redirect to login
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user based on the decoded token id
        let user = await Admin.findById(decoded.id) ||
            await Teacher.findById(decoded.id) ||
            await Student.findById(decoded.id);

        if (!user) {
            return res.redirect('/login'); // If user not found, redirect to login
        }

        req.user = user;  // Attach user to the request object for further use
        next();  // Allow the next middleware or route handler
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.redirect('/login');  // If token is invalid, redirect to login
    }
};

module.exports = authenticateUser;
