const express = require('express');
const router = express.Router();
const loginUser = require('../controllers/loginUser')
const teacherModel = require('../models/teacherModel');
const nodemailer = require('nodemailer');
const Principal = require('../models/principalModel');
const Academics = require('../models/academicsModel');
const Image = require('../models/galleryModel');
const Blogs = require('../models/blogsModel');


router.get('/', async (req, res) => {
    try {
        const images = await Image.find().limit(3); // Fetch all images from the database
        const displayBlogs = await Blogs.find().lean(); // Retrieve all blogs from the database

        // Limit the content of each blog to 30 words
        displayBlogs.forEach(blog => {
            if (blog.content) {
                // Clean up HTML tags and trim spaces
                const cleanedContent = blog.content.replace(/<[^>]*>/g, '').trim();
                const words = cleanedContent.split(' ').slice(0, 30); // Limit to 30 words
                blog.shortContent = words.join(' ') + (words.length === 30 ? '...' : ''); // Add '...' if the content is trimmed
            } else {
                blog.shortContent = ''; // Handle empty content
            }
        });

        console.log('Display Blogs:', displayBlogs); // Debugging step to see the processed blogs

        res.render('pages/home', {
            images, // Pass the images array to the view
            displayBlogs,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error fetching blogs:', error); // Log the error for debugging
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching gallery details.",
            homeLink: "/"
        });
    }
});

router.get('/blogs', async (req, res) => { // Corrected the route definition
    try {
        const showAllBlogs = await Blogs.find().lean(); // Fetch all blogs from the database
        // Limit the content of each blog to 30 words
        showAllBlogs.forEach(blog => {
            if (blog.content) {
                // Clean up HTML tags and trim spaces
                const cleanedContent = blog.content.replace(/<[^>]*>/g, '').trim();
                const words = cleanedContent.split(' ').slice(0, 30); // Limit to 30 words
                blog.shortContent = words.join(' ') + (words.length === 30 ? '...' : ''); // Add '...' if the content is trimmed
            } else {
                blog.shortContent = ''; // Handle empty content
            }
        });
        res.render('pages/showAllBlogs', { showAllBlogs }); // Pass the blogs to the view
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching the all blog posts.",
            homeLink: "/"
        });
    }
});


// Function to add a line break after every 5th sentence
function addLineBreaks(content) {
    const sentences = content.split(/(?<=[.?!])\s+/); // Split content into sentences using regex
    let modifiedContent = '';

    sentences.forEach((sentence, index) => {
        modifiedContent += sentence;
        if ((index + 1) % 5 === 0) {
            modifiedContent += '<br> <br>'; // Add an empty line after every 5th sentence
        }
    });
    return modifiedContent;
}

router.get('/blog/:id', async (req, res) => {
    try {
        const showBlog = await Blogs.findById(req.params.id);
        if (!showBlog) {
            return res.status(404).send('Blog not found');
        }

        // Add line breaks to the blog content
        const modifiedContent = addLineBreaks(showBlog.content);

        res.render('pages/showBlog', {
            showBlog: {
                ...showBlog._doc, // Spread the original blog data
                content: modifiedContent, // Pass the modified content
            }
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).render("pages/error", {
            errorCode: 500,
            errorMessage: "An error occurred while fetching the blog post.",
            homeLink: "/"
        });
    }
});











// Define routes for home pages
router.get('/facilities', (req, res) => {
    res.render("pages/facilities");
});


// Define routes for home pages
router.get('/becometeacher', (req, res) => {
    res.render("pages/becomeTeacher", {
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
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


router.get('/about', async (req, res) => {

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
        res.render("pages/aboutus", {
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


// Route to render the staff page with the first 6 teachers
router.get('/staff', async (req, res) => {
    try {
        // Fetch only the first 3 teachers
        let teachers = await teacherModel.find();

        if (teachers.length === 0) {
            console.log('No teachers found');
        }



        // Get total teacher count to check if more are available
        const totalTeachers = await teacherModel.countDocuments();
        // Render the staff page with teachers data
        res.render("pages/staff", {
            teachers,
            totalTeachers,
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
        pass: 'grni bjng sisc qgpn',        // App password generated from Google
    }
});

// Handle form submission
router.post('/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    const mailOptions = {
        from: email,
        to: 'imadhussain6655@gmail.com', // Your Gmail address
        phone: `Contact Form Submission from ${name} - ${phone}`,
        text: `You have received a message from ${name} (${email}).\n\nPhone: ${phone}\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Message Sent Successfully!');
        res.redirect('/contact');
    } catch (error) {
        req.flash('error_msg', 'Failed to send the message. Please try again later.');
        res.redirect('/contact');
    }
});

// Handle form submission
router.post('/apply-teacher', async (req, res) => {
    const { name, email, phone, message, subject, qualification } = req.body;

    const mailOptions = {
        from: email,
        to: 'imadhussain6655@gmail.com', // Your Gmail address
        subject: `Teacher Apply Form Submission from ${name} - ${phone}`,
        text: `You have received a message from ${name} (${email}).\n\nPhone: ${phone}\nSubject Specialization: ${subject}\nHighest Qualification: ${qualification}\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'Your application has been successfully submitted. Thank you for applying to join our team!');
        res.redirect('/becometeacher');
    } catch (error) {
        req.flash('error_msg', 'Unfortunately, we encountered an issue while submitting your application. Please try again later.');
        res.redirect('/becometeacher');
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

router.get('/discipline', (req, res) => {
    res.render('pages/discipline');
})

router.get('/sidebar', (req, res) => {
    res.render('partials/sidebar');
})

router.get('/feestructure', (req, res) => {
    res.render('pages/feeStructure');
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
