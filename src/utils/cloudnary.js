import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to Cloudinary directly from memory
const UploadOnCloudinary = async (fileBuffer, fileName) => {
    try {
        if (!fileBuffer) {
            console.log("No file buffer provided");
            return null;
        }

        const result = await cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto', // Automatically detect the file type (image, video, etc.)
                public_id: `uploads/${fileName}`, // You can specify a custom file name in Cloudinary
            },
            (error, result) => {
                if (error) {
                    console.log("Error uploading to Cloudinary:", error);
                    return null;
                }
                return result;
            }
        );

        // Pipe the buffer to Cloudinary's upload stream
        result.end(fileBuffer);

    } catch (error) {
        console.error("Error during Cloudinary upload:", error);
        return null;
    }
};

export default UploadOnCloudinary;
