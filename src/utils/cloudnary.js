import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            console.log("No file path provided");
            return null;
        }

        // Normalize the file path (in case there are issues with backslashes)
        const normalizedFilePath = path.resolve(filePath);

        const response = await cloudinary.uploader.upload(normalizedFilePath, {
            resource_type: 'auto',
        });

        // Delete the file from the local system after uploading
        fs.unlinkSync(normalizedFilePath);

        // Return the Cloudinary response with the uploaded file info
        return response;

    } catch (error) {
        // Make sure to remove the file in case of an error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return null;
    }
};

export default UploadOnCloudinary;