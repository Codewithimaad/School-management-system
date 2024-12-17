const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authenticateUser');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/multer-middleware'); // Multer middleware
const { uploadOnCloudinary } = require('../utils/cloudinary');
const Blogs = require('../models/blogsModel');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/dashboard/blogs/add', authenticateUser, checkRole('admin'), (req, res) => {
    try {
        res.render('dashboard/blogs/addBlogs', {
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        });

    } catch {
        console.error(error)
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/dashboard/blogs/add');
    }

})

router.post('/dashboard/blogs/add', authenticateUser, checkRole('admin'), upload.single('image'), async (req, res) => {



    const { title, content, author, } = req.body;
    console.log('Request Body:', req.body);

    if (!req.file) {
        req.flash('error_msg', 'Image upload is required.');
        return res.redirect('/dashboard/blogs/add');
    }

    const localFilePath = req.file.path;



    try {

        // Upload image to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        if (!cloudinaryResponse) {
            req.flash('error_msg', 'Failed to upload image.');
            return res.redirect('/dashboard/blogs/add');
        }


        const newBlog = await Blogs.create({
            title,
            content,
            author,
            imageUrl: cloudinaryResponse.url
        })



        console.log('New Blog Object:', newBlog);


        if (newBlog) {
            req.flash('success_msg', 'Blog posted Successfully.')
            return res.redirect('/dashboard/blogs/display');
        }

    } catch (error) {
        console.error('Error adding blog:', error);
        req.flash('error_msg', 'Something went wrong.');
        return res.redirect('/dashboard/blogs/add');
    }

})

router.get('/dashboard/blogs/display', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const showBlogs = await Blogs.find();
        res.render('dashboard/blogs/displayBlogs', {
            showBlogs,
            success_msg: req.flash('success_msg'), // Pass success flash message
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong.');
        return res.redirect('/dashboard/blogs/add');
    }
})

router.get('/dashboard/blogs/delete/:id', authenticateUser, checkRole('admin'), async (req, res) => {
    try {
        const deleteBlog = await Blogs.findOneAndDelete({ _id: req.params.id });

        if (deleteBlog) {
            req.flash('success_msg', 'Blog deleted Successfully.')
            return res.redirect('/dashboard/blogs/display');
        }
    } catch (error) {
        req.flash('error_msg', 'Something went wrong while deleting Blog.')
        return res.redirect(`/dashboard/blogs/delete/${req.params.id}`);
    }
})





module.exports = router;