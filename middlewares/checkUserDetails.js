const setUserDetails = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user; // Make user details available in EJS
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = setUserDetails;
