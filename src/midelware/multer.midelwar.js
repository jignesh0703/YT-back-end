import multer from 'multer';

const storage = multer.memoryStorage();  // Use memory storage for buffers instead of saving to disk

export const upload = multer({ storage });  // Use memory storage for incoming files
