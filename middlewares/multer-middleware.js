const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Temp directory path
const tempDir = path.join(__dirname, './upload/temp');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true }); // Creates the directory if missing
    console.log(`Created temp directory: ${tempDir}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir); // Use temp directory for multer storage
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
