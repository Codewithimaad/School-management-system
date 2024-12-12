const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcementModel');
const Class = require('../models/classModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const { body, validationResult } = require('express-validator');


// Render Add Announcement Form (Only Admin)
router.get('/dashboard/announcement/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch all classes from the database
        let classes = await Class.find();  // Assuming 'Class' is your model for classes

        // Render the add announcement form, passing classes for selection
        res.render('dashboard/announcementPages/add', {
            classes,  // Pass the classes array to the view
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading classes.');
        res.redirect('/dashboard');  // Redirect if something goes wrong
    }
});


// Add Announcement (POST request)
router.post('/dashboard/announcement/add', authenticateUser, checkRole('admin'),
    // Validation rules
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required'),
        body('audience').isIn(['admin', 'teacher', 'student', 'class', 'all']).withMessage('Invalid audience selected'),
        body('classId').optional().isMongoId().withMessage('Invalid class ID').custom((value, { req }) => {
            // Only validate classId if audience is 'class'
            if (req.body.audience === 'class' && !value) {
                req.flash('error_msg', 'Class ID is required when audience is "class"');
                return false;  // Return false to indicate validation failed
            }
            return true;
        }),
    ],
    async (req, res) => {
        // Capture validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are validation errors, send them back as flash messages
            req.flash('error_msg', errors.array().map(error => error.msg).join(', '));
            return res.redirect('/dashboard/announcement/add'); // Redirect back to the form
        }

        const { title, content, audience, classId } = req.body;

        try {
            // Create the new announcement
            const newAnnouncement = new Announcement({
                title,
                content,
                audience,
                classId: audience === 'class' ? classId : undefined, // Only set classId if targeting a class
            });

            await newAnnouncement.save();
            req.flash('success_msg', 'Announcement added successfully!');
            res.redirect('/dashboard/announcements'); // Redirect to announcements list page
        } catch (error) {
            req.flash('error_msg', 'Failed to add announcement');
            res.redirect('/dashboard/announcement/add');
        }
    }
);


// Fetch All Announcements (Admin View)
router.get('/dashboard/announcements', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('classId')  // Populate classId to get class details like name
            .exec();

        res.render('dashboard/announcementPages/announcementList', {
            announcements,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to fetch announcements');
        res.redirect('/dashboard');
    }
});


// Route to render edit page with classes
router.get('/dashboard/announcement/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch the announcement by ID
        const announcement = await Announcement.findById(req.params.id);

        // Fetch all classes
        const classes = await Class.find();

        // Check if announcement exists
        if (!announcement) {
            req.flash('error_msg', 'Announcement not found');
            return res.redirect('/dashboard/announcements');
        }

        // Render the edit view and pass the announcement and classes data
        res.render('dashboard/announcementPages/edit', {
            announcement,
            classes,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Route to update announcement details
router.post('/dashboard/announcement/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const { title, content, audience, classId } = req.body;

        // If audience is 'class', ensure the classId is sent
        const updatedAudience = audience === 'class' ? 'class' : audience;

        // Update the announcement
        await Announcement.findByIdAndUpdate(req.params.id, {
            title,
            content,
            audience: updatedAudience,
            classId: updatedAudience === 'class' ? classId : null, // Set classId only if audience is 'class'
        });

        req.flash('success_msg', 'Announcement updated successfully');
        res.redirect('/dashboard/announcements');  // Redirect to the list after success
    } catch (error) {
        req.flash('error_msg', 'Something went wrong while updating the announcement');
        res.redirect(`/dashboard/announcement/edit/${req.params.id}`);
    }
});




// Delete an Announcement (Admin only)
router.get('/dashboard/announcement/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const announcementId = req.params.id;
        await Announcement.findByIdAndDelete(announcementId); // Deletes the announcement from the database
        req.flash('success_msg', 'Announcement deleted successfully!');
        res.redirect('/dashboard/announcements'); // Redirect to the announcements list
    } catch (error) {
        req.flash('error_msg', 'Failed to delete announcement.');
        res.redirect('/dashboard/announcement/list');
    }
});


// Route to display announcements for students
router.get('/dashboard/announcement/student', authenticateUser, checkRole('student'), async (req, res) => {
    try {
        // Fetch announcements for students
        const announcements = await Announcement.find({ audience: 'students' })
            .sort({ createdAt: -1 }); // Sort by most recent announcements

        res.render('dashboard/announcementPages/student', {
            announcements,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load student announcements.');
        res.redirect('/dashboard');
    }
});

// Route to display announcements for teachers
router.get('/dashboard/announcement/teacher', authenticateUser, checkRole('teacher'), async (req, res) => {
    try {
        // Fetch announcements for teachers
        const announcements = await Announcement.find({ audience: 'teachers' })
            .sort({ createdAt: -1 }); // Sort by most recent announcements

        res.render('dashboard/announcementPages/teacher', {
            announcements,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load teacher announcements.');
        res.redirect('/dashboard');
    }
});

// Route to display announcements for the classes associated with the logged-in user
router.get('/dashboard/announcement/class', authenticateUser, checkRole('student'), async (req, res) => {
    try {
        // Fetch announcements for classes and populate the classId to get the class details
        const announcements = await Announcement.find({ audience: 'class' })
            .populate('classId')  // Populate classId to get class details like name
            .sort({ createdAt: -1 }); // Sort by most recent announcements

        res.render('dashboard/announcementPages/class', {
            announcements,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load class announcements.');
        res.redirect('/dashboard');
    }
});








module.exports = router;
