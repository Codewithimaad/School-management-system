const express = require('express');
const router = express.Router();
const classModel = require('../models/classModel');  // Your Class model
const teacherModel = require('../models/teacherModel'); // Teacher model to populate teacher options
const studentModel = require('../models/studentModel');  // Student model to populate student options
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/dashboard/class/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const students = await studentModel.find({ class: { $exists: false } }); // Example: Students without classes

        res.render("dashboard/classPages/addClass", {
            students,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('success_msg', 'Error while rendering add class page.');
        res.redirect('/dashboard/class/reports');
    }
});


router.post('/dashboard/class/add', authenticateUser, checkRole('admin'), async (req, res) => {
    const { name, section } = req.body;

    try {
        // Check for existing class with the same name
        const existingClass = await classModel.findOne({ name });

        if (existingClass) {
            return res.status(400).send("Class with this name already exists.");
        }

        const newClass = await classModel.create({
            name, section
        });

        req.flash('success_msg', 'Class added successfully!');
        res.redirect("/dashboard/class/reports");  // Redirect to the class reports page after adding the class
    } catch (error) {
        req.flash('error_msg', 'Something went Wrong!');
        res.redirect('dashboard/class/add');
    }
});


router.get("/dashboard/class/reports", authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const limit = 8; // Items per page
        const skip = (page - 1) * limit;

        const classes = await classModel.find()
            .populate('students')
            .skip(skip) // Skip items for pagination
            .limit(limit); // Limit the number of items

        const totalClasses = await classModel.countDocuments(); // Total number of classes
        const totalPages = Math.ceil(totalClasses / limit);

        res.render("dashboard/classPages/classReports", {
            classes,
            currentPage: page,
            totalPages,
            totalClasses,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Something went Wrong!');
        res.redirect('dashboard/class/reports');
    }
});




router.get("/dashboard/class/details/:id", authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch the class by ID and populate its students and teacher
        const classItem = await classModel.findById(req.params.id)
            .populate('students'); // Populate students information

        if (!classItem) {
            return res.status(404).send("Class not found");
        }

        // Ensure the timetable exists, if not, initialize it with empty data
        if (!classItem.timetable) {
            classItem.timetable = {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: []
            };
        }


        // Calculate the total number of students
        const totalStudents = classItem.students.length;

        // Render the class details page, passing the class data and total students count
        res.render("dashboard/classPages/details", {
            classItem,
            totalStudents,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Error while fetching class details.');
        res.redirect('dashboard/class/reports');
    }
});


// Class Delete Route
router.get("/dashboard/class/delete/:id", authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        let classes = await classModel.findOneAndDelete({ _id: req.params.id });

        res.redirect("/dashboard/class/reports");

    } catch (error) {
        req.flash('error_msg', 'Error while Deleting class.');
        res.redirect('dashboard/class/reports');
    }
});

// Edit Class Route (GET)
router.get('/dashboard/class/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const classItem = await classModel.findById(req.params.id)
            .populate('students'); // Populate students information

        if (!classItem) {
            return req.flash('error_msg', 'Class not Found.');
        }

        // Fetch available students for selection
        const students = await studentModel.find({ class: { $exists: false } });

        // Render the edit class page with existing class data and options for teachers and students
        res.render('dashboard/classPages/editClass', {
            classItem,
            students,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Error while rendering edit class page.');
        res.redirect('dashboard/class/reports');

    }
});

// Edit Class Route (POST)
router.post('/dashboard/class/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    const { name, section, students } = req.body;

    try {
        // Find the class by ID and update the class information
        const classItem = await classModel.findById(req.params.id);

        if (!classItem) {
            return req.flash('error_msg', 'Class not found.');

        }

        // Update the class details
        classItem.name = name;
        classItem.section = section;
        classItem.students = students; // Assuming students are passed as an array of student IDs

        // Save the updated class
        await classItem.save();

        req.flash('success_msg', 'Class updated successfully.');
        res.redirect("/dashboard/class/reports");  // Redirect to the class reports page after updating
    } catch (error) {
        req.flash('error_msg', 'Error while updating class.');
        res.redirect('dashboard/class/reports');

    }
});






module.exports = router;
