const express = require('express');
const router = express.Router();
const loginUser = require('../controllers/loginUser')
const teacherModel = require('../models/teacherModel');
const nodemailer = require('nodemailer');
const Principal = require('../models/principalModel');
const Academics = require('../models/academicsModel');
const Image = require('../models/galleryModel');


// Define routes for home pages
router.get('/', (req, res) => {
    res.render("pages/home");
});

router.get('/academics', async (req, res) => {
    try {
        const academics = await Academics.find().limit(3);

        res.render("pages/academics", { academics });
    } catch (error) {

        // Render the custom error page
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching academics details.",
            homeLink: "/"
        });
    }
});


router.get('/about', (req, res) => {
    res.render("pages/aboutus");
});


// Route to render the staff page with the first 6 teachers
router.get('/staff', async (req, res) => {
    try {
        // Fetch only the first 3 teachers
        let teachers = await teacherModel.find().limit(3);

        if (teachers.length === 0) {
            console.log('No teachers found');
        }



        // Get total teacher count to check if more are available
        const totalTeachers = await teacherModel.countDocuments();

        // Get the first principal from the database
        let principals = await Principal.find().limit(1); // Limit to only 1 principal




        // Render the staff page with teachers data
        res.render("pages/staff", {
            teachers,
            totalTeachers,
            principals
        });
    } catch (error) {
        // Render the custom error page
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching staff details.",
            homeLink: "/"
        });
    }
});


// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'imadhussain6655@gmail.com', // Your Gmail address
        pass: 'grni bjng sisc qgpn'        // App password generated from Google
    }
});

// Handle form submission
router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email,
        to: 'imadhussain6655@gmail.com', // Your Gmail address
        subject: `Contact Form Submission from ${name}`,
        text: `You have received a message from ${name} (${email}).\n\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Message Send Successfully.');
        res.redirect('/contact');
    } catch (error) {
        req.flash('error_msg', 'Failed to send the message. Please try again later');
        req.redirect('/contact');

    }
});



// Route to fetch all teachers when "See More" is clicked
router.get('/staff/more', async (req, res) => {
    try {
        const teachers = await teacherModel.find(); // Fetch all teachers


        res.render("pages/teacherList", { teachers });
    } catch (error) {
        // Render the custom error page
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching staff details.",
            homeLink: "/"
        });
    }
});

router.get('/dicipline', (req, res) => {
    res.render('pages/dicipline');
})

router.get('/sidebar', (req, res) => {
    res.render('partials/sidebar');
})

// Route to display all uploaded images and content in the gallery
router.get('/gallery', async (req, res) => {
    try {
        const images = await Image.find().limit(16); // Fetch all images from the database

        res.render('pages/gallery', {
            images, // Pass the images array to the view
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        // Render the custom error page
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching gallery details.",
            homeLink: "/"
        });
    }
});


router.get('/contact', (req, res) => {
    res.render("pages/contactus", {
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
});

// Login get Route
router.get('/login', (req, res) => {
    res.render("pages/login", {
        success_msg: req.flash('success_msg'), // Pass success flash message
        error_msg: req.flash('error_msg')
    });
});

// Login post Route
router.post('/login', loginUser);

module.exports = router;
