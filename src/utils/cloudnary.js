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

        // Check if the file exists locally
        if (!fs.existsSync(filePath)) {
            console.log(`File does not exist at path: ${filePath}`);
            return null;
        }

        // Normalize the file path (in case there are issues with backslashes)
        const normalizedFilePath = path.resolve(filePath);
        console.log(`Uploading file to Cloudinary from: ${normalizedFilePath}`);

        const response = await cloudinary.uploader.upload(normalizedFilePath, {
            resource_type: 'auto',
        });

        console.log("File uploaded successfully to Cloudinary:", response);

        // Delete the file from the local system after uploading
        fs.unlinkSync(normalizedFilePath);
        console.log("Local file deleted after upload");

        // Return the Cloudinary response with the uploaded file info
        return response;

    } catch (error) {
        console.log("Error during upload to Cloudinary:", error);

        // Ensure that the file is deleted from the local system in case of an error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Local file deleted after upload failure");
        }

        return null;
    }
};

export default UploadOnCloudinary;