import cloudinary from 'cloudinary';
import { Readable } from 'stream';

// Cloudinary Configuration (ensure you've set this up)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (file) => {
    const bufferStream = new Readable();
    bufferStream._read = () => {}; // _read is required but you can noop it
    bufferStream.push(file.buffer);  // Push the file buffer into the stream
    bufferStream.push(null);  // Indicate end of stream

    const uploadOptions = {
        resource_type: 'auto', // Automatically detect the resource type (image/video)
        folder: 'avatars-and-covers', // Specify the folder in Cloudinary
    };

    return new Promise((resolve, reject) => {
        bufferStream.pipe(cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }));
    });
};

export default UploadOnCloudinary;