// routes/auth.js
const express = require("express");
const { getForgotPassword, postForgotPassword, getResetPassword, postResetPassword } = require("../controllers/forgotPasswordController");
const router = express.Router();

// Forgot Password Route
router.get("/forgot-password", getForgotPassword);
router.post("/forgot-password", postForgotPassword);

// Reset Password Route
router.get("/reset-password/:role/:token", getResetPassword);
router.post("/reset-password/:role/:token", postResetPassword);

module.exports = router;