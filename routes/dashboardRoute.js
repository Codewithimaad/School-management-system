const express = require('express');
const router = express.Router();

const teacherModel = require('../models/teacherModel');
const studentModel = require('../models/studentModel');
const classModel = require('../models/classModel');
const feeAmount = require('../models/feesSChema');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');

router.get('/dashboard', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        // Fetch dynamic statistics
        const totalStudents = await studentModel.countDocuments();
        const totalTeachers = await teacherModel.countDocuments();
        const totalClasses = await classModel.countDocuments();

        // Calculate total fees collected
        const totalFeesCollected = await feeAmount.aggregate([
            { $match: { paymentStatus: { $regex: /^Paid$/i } } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);
        const feesCollected = totalFeesCollected.length > 0 ? totalFeesCollected[0].totalAmount : 0;



        res.render('dashboard/dashboardhome', {
            totalStudents,
            totalTeachers,
            totalClasses,
            feesCollected,
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg'),
        });
    } catch (error) {
        req.flash('error_msg', 'An error occurred while fetching dashboard data.');
        res.redirect('/');
    }
});

module.exports = router;
