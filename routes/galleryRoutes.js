const express = require('express');
const Image = require('../models/galleryModel');
const router = express.Router();
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');


// Route to render the gallery page (for displaying images)
router.get('/dashboard/gallery/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        res.render('dashboard/gallery/add', {
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard');
    }
});

router.post('/dashboard/gallery/add', authenticateUser, checkRole('admin'), upload.single('image'), async (req, res) => {

    const { title, content } = req.body; // Get content from form data
    const localFilePath = req.file.path;

    try {
        // Upload image to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        if (!cloudinaryResponse) {
            return req.flash('success_msg', 'Failed to upload image.');

        }

        let gallery = await Image.create({
            title,
            content,
            imageUrl: cloudinaryResponse.url
        });

        if (gallery) {
            req.flash('success_msg', 'Image Added to the Gallery.')
            return res.redirect('/dashboard/gallery/report')
        }
    } catch (error) {
        req.flash('error_msg', 'Error uploading image details.');
        res.redirect('/dashboard/gallery/add');
    }
});

// Route to display all uploaded images and content in the gallery
router.get('/dashboard/gallery/report', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const images = await Image.find(); // Fetch all images from the database

        res.render('dashboard/gallery/report', {
            images, // Pass the images array to the view
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load gallery images.');
        res.redirect('/dashboard');
    }
});


// Route to delete an image
router.post('/dashboard/gallery/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Find and delete the image by ID
        const deletedImage = await Image.findByIdAndDelete(req.params.id);

        if (!deletedImage) {
            req.flash('error_msg', 'Image not found.');
            return res.redirect('/dashboard/gallery/report');
        }

        req.flash('success_msg', 'Image deleted successfully.');
        res.redirect('/dashboard/gallery/report'); // Redirect to gallery report page after deletion
    } catch (error) {
        req.flash('error_msg', 'Failed to delete image.');
        res.redirect('/dashboard/gallery/report');
    }
});



// Route to render the edit page for a specific image
router.get('/dashboard/gallery/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {

    try {
        // Find the image by its ID
        const image = await Image.findById(req.params.id);

        if (!image) {
            req.flash('error_msg', 'Image not found.');
            return res.redirect('/dashboard/gallery/report');
        }

        // Render the edit page and pass the image data
        res.render('dashboard/gallery/edit', {
            image,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/gallery/report');
    }
});



// Route to handle the update of image details
router.post(
    '/dashboard/gallery/edit/:id',
    authenticateUser,
    checkRole('admin'),
    upload.single('image'),
    async (req, res) => {
        const { title, content } = req.body;
        let imageUrl = null;

        try {
            // Check if a new image is uploaded
            if (req.file) {
                const localFilePath = req.file.path;

                // Upload image to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

                if (!cloudinaryResponse) {
                    req.flash('error_msg', 'Failed to upload image.');
                    return res.redirect(`/dashboard/gallery/edit/${req.params.id}`);
                }

                imageUrl = cloudinaryResponse.url;
            }

            // Prepare update data
            const updateData = {
                title,
                content,
                ...(imageUrl && { imageUrl }), // Include imageUrl only if a new image is uploaded
            };

            // Update the Gallery details
            const updatedGallery = await Image.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedGallery) {
                req.flash('error_msg', 'Gallery item not found.');
                return res.redirect(`/dashboard/gallery/edit/${req.params.id}`);
            }

            req.flash('success_msg', 'Gallery updated successfully!');
            res.redirect('/dashboard/gallery/report');
        } catch (error) {
            console.error(error); // Log error for debugging
            req.flash('error_msg', 'Error updating gallery item.');
            res.redirect(`/dashboard/gallery/edit/${req.params.id}`);
        }
    }
);






module.exports = router;
