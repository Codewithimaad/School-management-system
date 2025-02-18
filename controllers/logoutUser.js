const logoutUser = (req, res) => {
    try {
        const userRole = req.user?.role || req.session?.userRole || 'guest'; // Use session as fallback

        res.clearCookie('token'); // Clear token
        req.flash('success_msg', 'You have been logged out successfully.');

        res.redirect('/login');

    } catch (error) {
        req.flash('error_msg', 'Something went wrong. Please try again.');
        return res.redirect('/login');
    }
};

module.exports = logoutUser;
