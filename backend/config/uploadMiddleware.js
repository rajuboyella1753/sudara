import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sudara_images',
    // allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    resource_type: 'auto', // This allows all file types (images, videos, etc.)
  },
});

export const upload = multer({ storage: storage });