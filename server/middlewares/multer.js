import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const createUploadsDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '..', 'uploads');
    
    // Determine the subdirectory based on the route
    if (req.path.includes('/blog')) {
      uploadPath = path.join(uploadPath, 'blog');
    } else if (req.path.includes('/lectures')) {
      uploadPath = path.join(uploadPath, 'lectures');
    } else if (req.path.includes('/profiles')) {
      uploadPath = path.join(uploadPath, 'profiles');
    } else {
      uploadPath = path.join(uploadPath, 'others');
    }

    // Create the directory if it doesn't exist
    createUploadsDir(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File upload path:', req.path);
  console.log('File mimetype:', file.mimetype);
  
  // Allow images for blog and profile routes
  if (req.path.includes('/blog') || req.path.includes('/profiles')) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
  // Allow more file types for lectures and course routes
  else if (req.path.includes('/lectures') || req.path.includes('/course')) {
    const allowedTypes = [
      'image/',
      'application/pdf',
      'video/',
      'audio/',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Please upload only images, PDFs, videos, audio, or documents.'), false);
    }
  }
  // Default to allowing images for other routes
  else {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});
