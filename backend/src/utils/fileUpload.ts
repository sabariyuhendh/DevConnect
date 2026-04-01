import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from './errors';
import { getParamAsString } from './helpers';

// Create secure upload directory outside web root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o750 });
}

// Create subdirectories for different file types
const createSubDir = (subPath: string) => {
  const fullPath = path.join(uploadDir, subPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true, mode: 0o750 });
  }
  return fullPath;
};

// Initialize subdirectories
createSubDir('profiles');
createSubDir('covers');
createSubDir('posts');
createSubDir('resumes');
createSubDir('events');

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: /\.(jpg|jpeg|png|gif|webp)$/i,
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  DOCUMENT: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: /\.(pdf|doc|docx)$/i,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  VIDEO: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    extensions: /\.(mp4|webm|ogg)$/i,
    maxSize: 50 * 1024 * 1024, // 50MB
  }
};

// Generate secure filename
const generateSecureFilename = (originalname: string): string => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const extension = path.extname(originalname).toLowerCase();
  return `${uniqueSuffix}${extension}`;
};

// File filter factory
const createFileFilter = (allowedTypes: typeof FILE_TYPES.IMAGE) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validate MIME type
    const mimeTypeValid = allowedTypes.mimeTypes.includes(file.mimetype);
    // Validate file extension
    const extValid = allowedTypes.extensions.test(path.extname(file.originalname).toLowerCase());

    if (mimeTypeValid && extValid) {
      cb(null, true);
    } else {
      cb(new AppError(`Invalid file type. Allowed types: ${allowedTypes.mimeTypes.join(', ')}`, 400));
    }
  };
};

// Storage configuration factory
const createStorage = (subDir: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const destPath = createSubDir(subDir);
      cb(null, destPath);
    },
    filename: (req, file, cb) => {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    },
  });
};

// Profile picture upload configuration
export const profilePictureUpload = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: FILE_TYPES.IMAGE.maxSize },
  fileFilter: createFileFilter(FILE_TYPES.IMAGE),
});

// Cover photo upload configuration
export const coverPhotoUpload = multer({
  storage: createStorage('covers'),
  limits: { fileSize: FILE_TYPES.IMAGE.maxSize },
  fileFilter: createFileFilter(FILE_TYPES.IMAGE),
});

// Post image upload configuration
export const postImageUpload = multer({
  storage: createStorage('posts'),
  limits: { fileSize: FILE_TYPES.IMAGE.maxSize },
  fileFilter: createFileFilter(FILE_TYPES.IMAGE),
});

// Resume upload configuration
export const resumeUpload = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: FILE_TYPES.DOCUMENT.maxSize },
  fileFilter: createFileFilter(FILE_TYPES.DOCUMENT),
});

// Event image upload configuration
export const eventImageUpload = multer({
  storage: createStorage('events'),
  limits: { fileSize: FILE_TYPES.IMAGE.maxSize },
  fileFilter: createFileFilter(FILE_TYPES.IMAGE),
});

// Generic upload configuration
export const genericUpload = multer({
  storage: createStorage('temp'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allAllowedMimes = [
      ...FILE_TYPES.IMAGE.mimeTypes,
      ...FILE_TYPES.DOCUMENT.mimeTypes
    ];
    
    if (allAllowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type', 400));
    }
  },
});

// File validation helper
export const validateFile = (file: Express.Multer.File, fileType: keyof typeof FILE_TYPES): boolean => {
  const config = FILE_TYPES[fileType];
  const mimeTypeValid = config.mimeTypes.includes(file.mimetype);
  const extValid = config.extensions.test(path.extname(file.originalname).toLowerCase());
  const sizeValid = file.size <= config.maxSize;
  
  return mimeTypeValid && extValid && sizeValid;
};

// File cleanup helper
export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Get file URL helper
export const getFileUrl = (filename: string, subDir: string): string => {
  return `/api/files/${subDir}/${filename}`;
};

// File serving middleware
export const serveFile = (req: Request, res: any, next: any) => {
  const subDir = getParamAsString(req.params.subDir);
  const filename = getParamAsString(req.params.filename);
  
  // Validate filename format (security check)
  if (!/^[a-f0-9]{32}\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|mp4|webm|ogg)$/i.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename format' });
  }
  
  // Validate subdirectory
  const allowedSubDirs = ['profiles', 'covers', 'posts', 'resumes', 'events'];
  if (!allowedSubDirs.includes(subDir)) {
    return res.status(400).json({ error: 'Invalid subdirectory' });
  }
  
  const filePath = path.join(uploadDir, subDir, filename);
  
  // Check if file exists and is readable
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Set appropriate Content-Type header
    res.type(path.extname(filename));
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (streamErr) => {
      console.error('Error streaming file:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error serving file' });
      }
    });
    
    fileStream.pipe(res);
  });
};

// Multer error handler
export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ error: 'File too large' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ error: 'Unexpected field name' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ error: 'Too many files' });
      default:
        return res.status(400).json({ error: `Upload error: ${error.message}` });
    }
  }
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  
  next(error);
};

export default {
  profilePictureUpload,
  coverPhotoUpload,
  postImageUpload,
  resumeUpload,
  eventImageUpload,
  genericUpload,
  validateFile,
  deleteFile,
  getFileUrl,
  serveFile,
  handleMulterError,
  FILE_TYPES
};
