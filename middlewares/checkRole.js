const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        // Set userRole in res.locals so it's available in the view
        res.locals.userRole = userRole;

        if (!allowedRoles.includes(userRole)) {
            if (userRole === 'admin') {
                req.flash('error_msg', 'Access Denied: admin cannot access this page.');
                return res.redirect('/dashboard'); // Redirect admin to their profile
            }
            if (userRole === 'teacher') {
                req.flash('error_msg', 'Access Denied: Teachers cannot access this page.');
                return res.redirect('/dashboard/profile'); // Redirect teacher to their profile
            }
            if (userRole === 'student') {
                req.flash('error_msg', 'Access Denied: Students cannot access this page.');
                return res.redirect('/dashboard/profile'); // Redirect student to their profile
            }

            // Default redirect if the role is unknown (just in case)
            req.flash('error_msg', 'Access Denied: You do not have permission to access this resource.');
            return res.redirect('/login'); // Or any default page you want for unknown users
        }

        next(); // Proceed if the role is allowed
    };
};

module.exports = checkRole;
