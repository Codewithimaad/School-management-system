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
        const students = await studentModel.find({ stdClass: { $exists: false } });

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
        let classToDelete = await classModel.findById(req.params.id);
        if (!classToDelete) {
            req.flash('error_msg', 'Class not found.');
            return res.redirect("/dashboard/class/reports");
        }

        // Remove reference from students
        await studentModel.updateMany(
            { stdClass: classToDelete._id },
            { $unset: { stdClass: "" } } // Remove class reference from students
        );

        await classModel.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Class deleted successfully.');
        res.redirect("/dashboard/class/reports");

    } catch (error) {
        req.flash('error_msg', 'Error while Deleting class.');
        res.redirect("/dashboard/class/reports");
    }
});


// Edit Class Route (GET)
router.get('/dashboard/class/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Find class and populate students
        const classItem = await classModel.findById(req.params.id).populate('students');
        if (!classItem) {
            req.flash('error_msg', 'Class not found.');
            return res.redirect('/dashboard/class/reports');
        }

        // Fetch all students (both assigned and unassigned)
        const students = await studentModel.find();

        res.render('dashboard/classPages/editClass', {
            classItem,
            students,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error while rendering edit class page.');
        res.redirect('/dashboard/class/reports');
    }
});





// Edit Class Route (POST)
router.post('/dashboard/class/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    const { name, section, students } = req.body;

    try {
        const classItem = await classModel.findById(req.params.id);
        if (!classItem) {
            req.flash('error_msg', 'Class not found.');
            return res.redirect("/dashboard/class/reports");
        }

        // Update class details
        classItem.name = name;
        classItem.section = section;

        await classItem.save();



        req.flash('success_msg', 'Class updated successfully.');
        res.redirect("/dashboard/class/reports");

    } catch (error) {
        console.error("Error while updating class:", error);
        req.flash('error_msg', 'Error while updating class.');
        res.redirect("/dashboard/class/reports");
    }
});


// **Class Reports Route (GET)**
router.get("/dashboard/class/reports", authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const limit = 8; // Items per page
        const skip = (page - 1) * limit;

        // Fetch classes and populate students along with their class details
        const classes = await classModel.find()
            .populate({
                path: 'students',
                select: 'name roll_number gender email phone', // Fetch only needed fields
            })
            .skip(skip)
            .limit(limit);

        const totalClasses = await classModel.countDocuments(); // Total number of classes
        const totalPages = Math.ceil(totalClasses / limit);

        // Log each class's students data
        classes.forEach(classItem => {
            console.log(classItem.students); // Log students for each class
        });





        res.render("dashboard/classPages/classReports", {
            classes,
            currentPage: page,
            totalPages,
            totalClasses,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });

    } catch (error) {
        console.error("Error fetching class reports:", error);
        req.flash('error_msg', 'Something went wrong!');
        res.redirect('/dashboard/class/reports');
    }
});










module.exports = router;
