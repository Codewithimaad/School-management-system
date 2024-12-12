const express = require('express');
const router = express.Router();
const Principal = require('../models/principalModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const { body, validationResult } = require('express-validator');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');

// Route to get the form for adding principal
router.get('/dashboard/principal/add', authenticateUser, checkRole('admin'), (req, res) => {
    try {
        res.render('dashboard/principal/Add', {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/principal/report');

    }
});

// Route to handle adding a new principal
router.post('/dashboard/principal/add',
    authenticateUser, checkRole('admin'), upload.single('image'), async (req, res) => {
        const { name, email, description } = req.body;
        const localFilePath = req.file.path;

        try {

            // Upload image to Cloudinary
            const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

            if (!cloudinaryResponse) {
                return req.flash('success_msg', 'Failed to upload image.');

            }

            let addPrincipal = await Principal.create({
                name,
                email,
                description,
                imageUrl: cloudinaryResponse.url
            });
            if (addPrincipal) {
                req.flash('success_msg', 'Principal added successfully!');
                return res.redirect('/dashboard/principal/report');
            }

        } catch (error) {
            req.flash('error_msg', 'Something went wrong.');
            res.redirect('/dashboard/principal/report');

        }
    });

// Route to get all principals for reporting
router.get('/dashboard/principal/report', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        let principals = await Principal.find();

        res.render('dashboard/principal/report', {
            principals,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard');
    }
});

// Route to get the edit form for a principal
router.get('/dashboard/principal/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const principal = await Principal.findById(req.params.id);
        if (!principal) {
            req.flash('error_msg', 'Principal not found.');
            return res.redirect('/dashboard/principal/report');
        }
        res.render('dashboard/principal/edit', {
            principal,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (err) {
        req.flash('error_msg', 'Server Error.');
        res.redirect('/dashboard/principal/report');

    }
});

// Route to handle updating principal information
router.post('/dashboard/principal/edit/:id',
    upload.single('image'),
    authenticateUser,
    checkRole('admin'),
    async (req, res) => {
        const { name, email, description } = req.body;
        let imageUrl = null;

        try {
            // Check if a new image is uploaded
            if (req.file) {
                const localFilePath = req.file.path;

                // Upload image to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

                if (!cloudinaryResponse) {
                    req.flash('error_msg', 'Failed to upload image.');
                    return res.redirect(`/dashboard/principal/edit/${req.params.id}`);
                }

                imageUrl = cloudinaryResponse.url;
            }

            // Update principal details
            const updatedPrincipal = {
                name,
                email,
                description,
                ...(imageUrl && { imageUrl }), // Include imageUrl only if it's updated
            };

            const principal = await Principal.findByIdAndUpdate(req.params.id, updatedPrincipal, { new: true });

            if (!principal) {
                req.flash('error_msg', 'Principal not found.');
                return res.redirect(`/dashboard/principal/edit/${req.params.id}`);
            }

            req.flash('success_msg', 'Principal updated successfully!');
            res.redirect('/dashboard/principal/report');
        } catch (err) {
            console.error(err); // Log the error for debugging purposes
            req.flash('error_msg', 'Error updating principal.');
            res.redirect(`/dashboard/principal/edit/${req.params.id}`);
        }
    }
);


router.get('/dashboard/principal/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const principal = await Principal.findOneAndDelete({ _id: req.params.id });

        if (!principal) {
            req.flash('error_msg', 'Principal not found!');
            return res.redirect('/dashboard/principal/report');
        }

        // Flash success message and redirect
        req.flash('success_msg', 'Principal deleted successfully!');
        res.redirect('/dashboard/principal/report');
    } catch (err) {
        req.flash('error_msg', 'Server Error.');
        res.redirect('/dashboard/principal/report');

    }
});



module.exports = router;
