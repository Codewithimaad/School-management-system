const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'your_mongodb_connection_string';

// Create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads', // Collection in MongoDB
                };
                resolve(fileInfo);
            });
        });
    },
});

module.exports = storage;
