const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Admin = require("../models/adminModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const dotenv = require('dotenv');

dotenv.config();

// Forgot Password - Render Form
const getForgotPassword = (req, res) => {
    res.render("pages/forgotPassword", {
        success_msg: req.flash('success_msg'), // Pass success flash message
        error_msg: req.flash('error_msg')     // Pass error flash message
    });
};

// Forgot Password - Handle Form Submission
const postForgotPassword = async (req, res) => {
    const { email, role } = req.body;

    try {
        console.log("Received forgot password request for:", email, role); // Debug log

        let user;
        switch (role) {
            case "admin":
                user = await Admin.findOne({ email });
                break;
            case "teacher":
                user = await Teacher.findOne({ email });
                break;
            case "student":
                user = await Student.findOne({ email });
                break;
            default:
                req.flash('error_msg', 'Invalid role.');
                return res.redirect('/forgot-password');
        }

        if (!user) {
            console.log("No user found with email:", email); // Debug log
            req.flash('error_msg', 'No account with that email exists.');
            return res.redirect('/forgot-password');
        }

        // Generate a token
        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        console.log("Reset token generated for user:", user.email); // Debug log

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #007BFF; padding: 20px; text-align: center;">
                        <h1 style="color: #fff; margin: 0;">Password Reset</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                        <p>Please click the button below to reset your password:</p>
                        <a href="${process.env.FRONT_END_URL}/reset-password/${role}/${token}" 
                           style="display: inline-block; background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                            Reset Password
                        </a>
                        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                        <p style="word-break: break-all;">
                            <a href="${process.env.FRONT_END_URL}/reset-password/${role}/${token}" style="color: #007BFF;">
                                ${process.env.FRONT_END_URL}/reset-password/${role}/${token}
                            </a>
                        </p>
                        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    </div>
                    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </div>
            `,
        };

        console.log("Sending email to:", user.email); // Debug log

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error); // Debug log
            } else {
                console.log("Email sent successfully:", info.response); // Debug log
            }
        });

        req.flash('success_msg', 'An email has been sent with further instructions.');
        res.redirect('/forgot-password');
    } catch (err) {
        console.error("Error in postForgotPassword:", err); // Debug log
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/forgot-password');
    }
};

// Reset Password - Render Form
const getResetPassword = async (req, res) => {
    const { role, token } = req.params;

    try {
        let user;
        switch (role) {
            case "admin":
                user = await Admin.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            case "teacher":
                user = await Teacher.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            case "student":
                user = await Student.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            default:
                req.flash('error_msg', 'Invalid role.');
                return res.redirect('/forgot-password');
        }

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        res.render("pages/resetPassword", {
            token,
            role,
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')     // Pass error flash message
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/forgot-password');
    }
};

// Reset Password - Handle Form Submission
const postResetPassword = async (req, res) => {
    const { role, token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match.');
            return res.redirect(`/reset-password/${role}/${token}`);
        }

        let user;
        switch (role) {
            case "admin":
                user = await Admin.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            case "teacher":
                user = await Teacher.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            case "student":
                user = await Student.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: Date.now() },
                });
                break;
            default:
                req.flash('error_msg', 'Invalid role.');
                return res.redirect('/forgot-password');
        }

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        // Update password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Your password has been successfully reset.');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect(`/reset-password/${role}/${token}`);
    }
};

module.exports = { getForgotPassword, postForgotPassword, getResetPassword, postResetPassword };