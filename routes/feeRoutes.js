const express = require('express');
const router = express.Router();
const Fee = require('../models/feesSChema');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');

// Add Fee Page
router.get('/dashboard/fee/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const classes = await Class.find();
        res.render('dashboard/fee/add', {
            classes,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading add fee page.');
        res.redirect('/dashboard');
    }
});

// Fetch Students by Class ID (AJAX Endpoint)
router.get('/dashboard/fee/students/:classId', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const { classId } = req.params;
        const students = await Student.find({ stdClass: classId }).select('name roll_number');
        res.json(students);
    } catch (error) {
        req.flash('error_msg', 'Error fetching students.');

    }
});

// ✅ Route to add fee (Admin only)
router.post('/dashboard/fee/add', authenticateUser, checkRole('admin'), async (req, res) => {
    const { classId, studentId, category, amount, dueDate, month } = req.body;

    try {
        // Validate if class and student exist
        const student = await Student.findById(studentId);
        const classData = await Class.findById(classId);

        if (!student || !classData) {
            req.flash('error_msg', 'Invalid student or class selected!');
            return res.redirect('/dashboard/fee/reports');
        }

        // Create and save fee
        const fee = new Fee({ classId, studentId, category, amount, dueDate, month });
        await fee.save();

        req.flash('success_msg', 'Fee added successfully!');
        res.redirect('/dashboard/fee/reports');
    } catch (error) {
        console.error("Error adding fee:", error);
        req.flash('error_msg', 'Error adding fee.');
        res.redirect('/dashboard/fee/reports');
    }
});

// ✅ Route to display fee reports
router.get('/dashboard/fee/reports', authenticateUser, checkRole('admin'), async (req, res) => {
    const { classId, studentId, paymentStatus, startDate, endDate, page = 1 } = req.query;

    const query = {
        studentId: { $exists: true }, // Ensure fees are linked to a valid student
    };

    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
        query.dueDate = {};
        if (startDate) query.dueDate.$gte = new Date(startDate);
        if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    try {
        const classes = await Class.find();
        const students = classId
            ? await Student.find({ stdClass: classId }).select('name roll_number')
            : await Student.find().select('name roll_number');

        // ✅ Optimized Pagination
        const limit = 15;
        const skip = (page - 1) * limit;

        // ✅ Fetch fees with population
        const fees = await Fee.find(query)
            .populate('classId', 'name')  // Populate class name
            .populate('studentId', 'name roll_number') // Populate student name & roll_number
            .sort({ dueDate: -1 })
            .skip(skip)
            .limit(limit);

        // ✅ Get total fee count & sum
        const totalFees = await Fee.countDocuments(query);
        const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
        const totalPages = Math.ceil(totalFees / limit);

        res.render('dashboard/fee/report', {
            fees,
            classes,
            students,
            filters: req.query,
            currentPage: parseInt(page),
            totalFees,
            totalAmount,
            totalPages,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error("Error loading fee reports:", error);
        req.flash('error_msg', 'Error loading fee reports.');
        res.redirect('/dashboard/fee/reports');
    }
});


// Route to delete fee Record
router.get('/dashboard/fee/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {

    try {
        const deleteFee = await Fee.findOneAndDelete({ _id: req.params.id });

        if (deleteFee) {
            req.flash('success_msg', 'Fee deleted successfully');
            return res.redirect('/dashboard/fee/reports')
        }
        else {
            req.flash('error_msg', 'Something went Wrong.')
            return res.redirect('/dashboard/fee/reports');
        }
    } catch (error) {
        req.flash('error_msg', 'Error Deleting fee record.');
        res.redirect('/dashboard/fee/reports');
    }

});



// Update Fee Payment Status to "Paid"
router.post('/dashboard/fee/mark-paid/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const feeId = req.params.id;

        // Update the fee's payment status
        const markedPaid = await Fee.findByIdAndUpdate(feeId, {
            paymentStatus: 'Paid',
            paymentDate: new Date(),
        });

        if (markedPaid) {
            // Check if the request is an AJAX request
            if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
                return res.status(200).json({ message: 'Fee marked as Paid successfully.' });
            }
            req.flash('success_msg', 'Fee Marked Paid Successfully.');
            return res.redirect('/dashboard/fee/reports');
        } else {
            if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
                return res.status(400).json({ message: 'Failed to mark fee as Paid.' });
            }
            req.flash('error_msg', 'Something went wrong.');
            return res.redirect('/dashboard/fee/reports');
        }
    } catch (error) {
        console.error(error);
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.status(500).json({ message: 'An error occurred while updating the fee status.' });
        }
        req.flash('error_msg', 'Error updating payment status.');
        return res.redirect('/dashboard/fee/reports');
    }
});



router.get('/dashboard/fee/details/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const feeId = req.params.id;

        const fee = await Fee.findById(feeId)
            .populate('classId', 'name')
            .populate('studentId', 'name roll_number');

        if (!fee) {
            return res.status(404).send('Fee not found');
        }

        res.render('dashboard/fee/details', { fee });
    } catch (error) {
        req.flash('error_msg', 'Error loading fee details.');
        res.redirect('/dashboard/fee/reports');

    }
});
;


module.exports = router;
