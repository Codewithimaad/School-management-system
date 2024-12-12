const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const upload = require('../config/multer-config');
const academicsModel = require('../models/academicsModel');

router.get('/dashboard/academics/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        res.render('dashboard/academics/add', {
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    }
    catch {
        req.flash('error_msg', 'Something went Wrong.');
        res.redirect('/dashboard');
    }
})


router.post('/dashboard/academics/add', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const { title, content } = req.body;

        let addAcademics = await academicsModel.create({
            title,
            content
        });

        if (addAcademics) {
            req.flash('success_msg', 'Academics details added successfully.')
            return res.redirect('/dashboard/academics/add');
        }

    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/academics/add');
    }
});


router.get('/dashboard/academics/reports', authenticateUser, checkRole('admin'), async (req, res) => {
    try {

        const Academics = await academicsModel.find();
        res.render('dashboard/academics/academicsReport', {
            Academics,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        })

    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard');
    }
});


router.get('/dashboard/academics/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const academics = await academicsModel.findOne({ _id: req.params.id });

        if (!academics) {
            req.flash('error_msg', 'Academics not found.')
            return res.redirect('/dashboard/academics/reports');
        }

        res.render('dashboard/academics/edit', {
            academics,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });

    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/academics/reports');
    }
})

router.post('/dashboard/academics/edit/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const updateAcademics = await academicsModel.findOneAndUpdate({ _id: req.params.id }, {
            title,
            content
        })

        if (updateAcademics) {
            req.flash('success_msg', 'Academics details updated Successfully.')
            return res.redirect('/dashboard/academics/reports');
        }

    }
    catch (error) {
        req.flash('error_msg', 'Error Updating Academics details.');
        res.redirect('/dashboard/academics/reports');
    }
})


router.get('/dashboard/academics/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const deleteAcademics = await academicsModel.findOneAndDelete({ _id: req.params.id });

        if (deleteAcademics) {
            req.flash('success_msg', 'Academics details deleted successfully.');
            return res.redirect('/dashboard/academics/reports');
        }
    } catch (error) {
        req.flash('error_msg', 'Error deleting Academics details.');
        res.redirect('/dashboard/academics/reports');
    }

})


module.exports = router;
