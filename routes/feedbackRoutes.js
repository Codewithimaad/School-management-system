const express = require('express');
const router = express.Router();
const feedBack = require('../models/feedBackModel');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');



router.get('/feedback', async (req, res) => {
    try {
        const Allfeedbacks = await feedBack.find();
        res.render('pages/feedBack', {
            Allfeedbacks,
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        });

    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching the feedback Page.",
            homeLink: "/feedback"
        });
    }
})

router.post('/feedback', upload.single('image'), async (req, res) => {

    const { name, comments, role } = req.body;

    if (!req.file) {
        req.flash('error_msg', 'Image upload is required.');
        return res.redirect('/dashboard/blogs/add');
    }

    const localFilePath = req.file.path;

    try {
        // Upload image to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        if (!cloudinaryResponse) {
            req.flash('error_msg', 'Failed to upload image.');
            return res.redirect('/feedback');
        }

        const newFeedback = await feedBack.create({
            name,
            comments,
            role,
            imageUrl: cloudinaryResponse.url
        })

        if (newFeedback) {
            req.flash('success_msg', 'Your Feedback posted Successfully.')
            return res.redirect('/feedback');
        }


    } catch (error) {
        console.error('Error adding blog:', error);
        req.flash('error_msg', 'Something went wrong while adding Feedback.');
        return res.redirect('/feedback');
    }
})











module.exports = router;