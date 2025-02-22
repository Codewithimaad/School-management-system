const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const logoutUser = require('../controllers/logoutUser');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const adminModel = require('../models/adminModel');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/dashboard/admin/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        res.render('dashboard/admin/add', {
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
    }
});

// Add admin route (POST)
router.post('/dashboard/admin/add', authenticateUser, checkRole('admin'), upload.single('image'), async (req, res) => {


    const { name, email, password, gender, phone, description } = req.body;
    let imageUrl = null; // Default to null if no image is uploaded

    try {
        // Check if an image is uploaded
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path); // Upload image
            if (cloudinaryResponse) {
                imageUrl = cloudinaryResponse.url; // Set uploaded image URL
            } else {
                req.flash('error_msg', 'Failed to upload image.');
                return res.redirect('/dashboard/admin/add');
            }
        }

        // Check if the admin already exists
        let admin = await adminModel.findOne({ email });
        if (admin) {
            req.flash('error_msg', 'User with the same email already exists.');
            return res.redirect('/dashboard/admin/add');
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new admin
        await adminModel.create({
            name,
            email,
            gender,
            phone,
            description,
            password: hashedPassword,
            imageUrl,
            role: 'admin',
        });

        req.flash('success_msg', 'Admin added successfully.');
        // Redirect to the reports page
        res.redirect('/dashboard/admin/reports');
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        // Render the error page with message
        res.redirect('/dashboard/admin/add');
    }
}
);


// Route to Delete Admin
router.get('/dashboard/admin/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        let deleteAdmin = await adminModel.findOneAndDelete({ _id: req.params.id });
        if (deleteAdmin) {
            req.flash('success_msg', 'Admin Deleted successfully!');
            res.redirect('/dashboard/admin/reports');
        }
    } catch (err) {
        req.flash('error_msg', 'Error deleting the admin. Please try again.');
        res.redirect('/dashboard/admin/reports');
    }
});

// Edit Admin Route (GET)
router.get('/dashboard/admin/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch the admin by ID
        const admin = await adminModel.findById(req.params.id).lean();

        if (!admin) {
            req.flash('error_msg', 'Admin not found.');
            return res.redirect('/dashboard/admin/reports');
        }

        // Render the edit form with admin details
        res.render('dashboard/admin/Edit', {
            admin,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/admin/reports');
    }
});

// Edit Admin Route (POST)
router.post('/dashboard/admin/edit/:id',
    authenticateUser,
    checkRole('admin'),
    upload.single('image'),
    async (req, res) => {
        const { name, email, gender, phone, description } = req.body;
        let imageUrl = null;

        try {
            // Check if a new image is uploaded
            if (req.file) {
                const localFilePath = req.file.path;

                // Upload image to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

                if (!cloudinaryResponse) {
                    req.flash('error_msg', 'Failed to upload image.');
                    return res.redirect(`/dashboard/admin/edit/${req.params.id}`);
                }

                imageUrl = cloudinaryResponse.url;
            }

            // Prepare update data
            const updateData = {
                name,
                email,
                phone,
                gender,
                description,
                ...(imageUrl && { imageUrl }), // Include imageUrl only if it exists
            };

            // Update the Admin details
            const updatedAdmin = await adminModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedAdmin) {
                req.flash('error_msg', 'Admin not found.');
                return res.redirect(`/dashboard/admin/edit/${req.params.id}`);
            }

            req.flash('success_msg', 'Admin updated successfully!');
            res.redirect('/dashboard/admin/reports');
        } catch (error) {
            console.error(error); // Log error for debugging
            req.flash('error_msg', 'Something went wrong while updating the admin.');
            res.redirect(`/dashboard/admin/edit/${req.params.id}`);
        }
    }
);



// Admin List Page
router.get('/dashboard/admin/reports', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch all admins and include lastLogin
        const admins = await adminModel.find().lean();

        // Pass admins and other data to the view
        res.render('dashboard/admin/AdminList', {
            admins,
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg'),     // Pass error flash message
        });
    } catch (error) {
        // Render the error page with message
        res.render('error', { message: 'Failed to load admin list.' });
    }
});


router.post('/dashboard/admin/change-password', authenticateUser, async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const userId = req.user.id; // Extracted from JWT authentication middleware

        // Validate input
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            req.flash('error_msg', 'All fields are required.');
            return res.redirect('/change-password');
        }

        if (newPassword !== confirmNewPassword) {
            req.flash('error_msg', 'New passwords do not match.');
            return res.redirect('/change-password');
        }

        // Find user by ID (using Admin model)
        const user = await adminModel.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/change-password');
        }

        // Check if old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Old password is incorrect.');
            return res.redirect('/change-password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        user.password = hashedPassword;
        await user.save();

        req.flash('success_msg', 'Password changed successfully!');
        res.redirect('/dashboard'); // Redirect to dashboard or login
    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard');
    }
});


// Logout route
router.get('/dashboard/logout', authenticateUser, logoutUser);

module.exports = router;
