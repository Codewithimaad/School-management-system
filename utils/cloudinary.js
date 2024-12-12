const Cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Ensure the environment variables are being loaded
Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await Cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',  // Auto means it can handle images, video, etc.
        });

        // File uploaded successfully, clean up the local file
        fs.unlinkSync(localFilePath);
        console.log("File is uploaded on Cloudinary:", response.url);

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Cleanup the local file on failure
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

// Export the Cloudinary configuration and methods
module.exports = {
    uploadOnCloudinary,
    Cloudinary,
};
