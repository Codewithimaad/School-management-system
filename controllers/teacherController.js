const express = require('express');
const teacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');
const { uploadOnCloudinary } = require('../utils/cloudinary');

const postAddTeacher = async (req, res) => {
    const { name, subject, salary, qualification, gender, email, phone, password, status, description } = req.body;
    let errors = {}; // Store error messages
    let imageUrl = null;

    try {
        // Input validation
        if (!name) errors.name = 'Name is required';
        if (!subject) errors.subject = 'Subject is required';
        if (!salary) errors.salary = 'Salary is required';
        if (!qualification) errors.qualification = 'Qualification is required';
        if (!gender) errors.gender = 'Gender is required';
        if (!email) errors.email = 'Email is required';
        if (!phone) errors.phone = 'Phone number is required';
        if (!status) errors.status = 'Status is required';
        if (!description) errors.description = 'Description is required';
        if (!password) errors.password = 'Password is required';

        // Check if email already exists
        console.log('Checking email:', email);
        const existingTeacher = await teacherModel.findOne({ email });
        console.log('Existing Teacher:', existingTeacher);
        if (existingTeacher) {
            errors.email = 'Teacher with the same email already exists.';
        }

        // If validation errors exist, return them
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Upload image if provided
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse) {
                imageUrl = cloudinaryResponse.url; // Fixed typo: `ul` -> `url`
            } else {
                return res.status(500).json({ success: false, errors: { image: 'Failed to upload image' } });
            }
        }

        // Hash password securely
        let hashedPassword;
        try {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        } catch (err) {
            return res.status(500).json({ success: false, errors: { password: 'Error hashing password' } });
        }

        // Create new teacher
        const newTeacher = new teacherModel({
            name,
            subject,
            email,
            phone,
            gender,
            password: hashedPassword,
            salary,
            status,
            qualification,
            description,
            imageUrl,
            role: 'teacher',
        });

        // Save the new teacher to the database
        await newTeacher.save();

        // Flash success message and redirect
        req.flash('success_msg', 'Teacher Added Successfully.');
        return res.status(200).json({ success: true, redirectUrl: '/dashboard/teacher/reports' });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong while adding the teacher.');
        return res.status(200).json({ success: false, redirectUrl: '/dashboard/teacher/reports' });
    }
};

module.exports = { postAddTeacher };