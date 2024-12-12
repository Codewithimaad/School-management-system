function setUserRole(req, res, next) {
    if (req.user) { // Assuming req.user contains logged-in user info
        res.locals.userRole = req.user.role; // Set role to be accessible in views
    } else {
        res.locals.userRole = null;
    }
    next();
}

module.exports = setUserRole;