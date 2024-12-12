const logoutUser = (req, res) => {
    try {
        console.log('User during logout:', req.user);
        console.log('Token from cookie:', req.cookies.token);

        const userRole = req.user?.role || req.session?.userRole || 'guest'; // Use session as fallback
        console.log('User role:', userRole);

        res.clearCookie('token'); // Clear token
        req.flash('success_msg', 'You have been logged out successfully.');

        res.redirect('/login');

    } catch (error) {
        console.error('Error during logout:', error.message);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        return res.redirect('/login');
    }
};

module.exports = logoutUser;
