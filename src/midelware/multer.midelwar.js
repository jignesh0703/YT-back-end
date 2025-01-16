import multer from 'multer';
import fs from 'fs';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

const uploadDir = path.join(__dirname, 'public', 'upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });