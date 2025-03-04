const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Read JWT from cookies


    if (!token) {
        req.user = null;  // Ensure user is null if no token is found
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        let user;

        // Fetch user based on decoded role and ID
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id);
        } else if (decoded.role === 'teacher') {
            user = await Teacher.findById(decoded.id);
        } else if (decoded.role === 'student') {
            user = await Student.findById(decoded.id);
        }

        if (!user) {
            req.user = null;
            return next();
        }

        // Attach user details to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            gender: user.gender,
            imageUrl: user.imageUrl || '/images/Male logo.png',
        };

        next();
    } catch (error) {
        console.error("JWT Verification Failed:", error);
        req.user = null;
        next();
    }
};

module.exports = authMiddleware;
