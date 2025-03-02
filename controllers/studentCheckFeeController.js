const Fee = require("../models/feesSChema");
const Student = require("../models/studentModel");

// Get fee details for a student
const getStudentFee = async (req, res) => {
    try {
        const studentId = req.user.id;
        if (!studentId) {
            req.flash('error_msg', 'Student not found');
            return res.redirect('/dashboard/profile');
        }

        // Extract dates from query parameters
        let { startDate, endDate } = req.query;
        let filter = { studentId };

        if (startDate && endDate) {


            filter.dueDate = {
                $gte: new Date(`${startDate}T00:00:00.000Z`),
                $lte: new Date(`${endDate}T23:59:59.999Z`),
            };
        }

        // Fetch filtered fee details
        const feeDetails = await Fee.find(filter)
            .populate("studentId", "name email")
            .populate("classId", "name")
            .sort({ dueDate: 1 });


        res.render("dashboard/studentPages/checkStudentFee", {
            student: feeDetails.length > 0 ? feeDetails[0].studentId.name : "N/A",
            email: feeDetails.length > 0 ? feeDetails[0].studentId.email : "N/A",
            fees: feeDetails,
            startDate,
            endDate,
        });

    } catch (error) {
        console.error("Error fetching fee details:", error);
        req.flash("error_msg", "Internal server error");
        res.redirect("/dashboard/profile");
    }
};

// Print fee details
const printFee = async (req, res) => {
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
        res.redirect('/dashboard/profile');
    }
};

module.exports = { getStudentFee, printFee };
