import multer from 'multer'
import fs from 'fs';

const uploadDirectory = path.resolve(__dirname, 'public', 'upload');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDirectory)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage
})