const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/mongodb/db');



// Routes
const homeRoutes = require('./routes/homeroutes');
const dashboardHomeRoute = require('./routes/dashboardRoute')
const teachersRoutes = require('./routes/teachersRoutes');
const studentRoutes = require('./routes/studentsRoutes');
const classRoutes = require('./routes/classRoutes');
const feeRoutes = require('./routes/feeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoutes = require('./routes/profileRoute');
const announcementRoutes = require('./routes/announcementRoutes');
const principalRoutes = require('./routes/principalRoutes');
const academicsRoutes = require('./routes/academicsroutes');
const galleryRoutes = require('./routes/galleryRoutes');
const blogsRoutes = require('./routes/blogsRoutes');

const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');




// Initialize Express App
const app = express();

// Make moment globally available to all views
app.locals.moment = moment;

dotenv.config();

// Connect to MongoDB
connectDB();




// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));  // This enables method override

app.set('trust proxy', 1); // Trust the reverse proxy


app.use(session({
    secret: "flashMessage",
    saveUninitialized: false, // Don't save empty sessions
    resave: false,            // Avoid resaving unchanged sessions
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        httpOnly: true,                               // Helps protect against XSS
        maxAge: 3600000                               // 1-hour expiration
    }
}));



// Use flash middleware
app.use(flash());



// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));
// Serve static files like CSS
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use(homeRoutes);
app.use(dashboardHomeRoute);
app.use(teachersRoutes);
app.use(studentRoutes);
app.use(classRoutes);
app.use(feeRoutes);
app.use(adminRoutes);
app.use(attendanceRoutes);
app.use(profileRoutes);
app.use(announcementRoutes);
app.use(principalRoutes);
app.use(academicsRoutes);
app.use(galleryRoutes);
app.use(blogsRoutes);




// Start the server
const PORT = process.env.PORT || 5000;  // Render will provide a dynamic port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

