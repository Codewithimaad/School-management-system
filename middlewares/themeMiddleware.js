const themeMiddleware = (req, res, next) => {
    // Check for the theme in cookies (or localStorage if using client-side logic)
    const theme = req.cookies.theme || "light"; // Default to "light" if no theme is set

    // Attach the theme to res.locals so it's available in all views
    res.locals.theme = theme;

    // Proceed to the next middleware or route handler
    next();
};

module.exports = themeMiddleware;