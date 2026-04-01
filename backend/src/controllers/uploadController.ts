import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { getFileUrl, deleteFile } from '../utils/fileUpload';
import path from 'path';

// Upload profile picture
export const uploadProfilePicture = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const userId = req.user!.id;
  const filename = req.file.filename;
  const fileUrl = getFileUrl(filename, 'profiles');

  try {
    // Get current profile picture to delete old one
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true }
    });

    // Update user profile picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: fileUrl },
      select: {
        id: true,
        username: true,
        profilePicture: true
      }
    });

    // Delete old profile picture if it exists and is a local file
    if (currentUser?.profilePicture && currentUser.profilePicture.startsWith('/api/files/profiles/')) {
      const oldFilename = path.basename(currentUser.profilePicture);
      const oldFilePath = path.join(__dirname, '../../uploads/profiles', oldFilename);
      try {
        await deleteFile(oldFilePath);
      } catch (error) {
        console.warn('Failed to delete old profile picture:', error);
      }
    }

    successResponse(res, {
      user: updatedUser,
      file: {
        filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    }, 201, 'Profile picture uploaded successfully');

  } catch (error) {
    // Clean up uploaded file if database update fails
    try {
      await deleteFile(req.file.path);
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError);
    }
    throw error;
  }
};

// Upload cover photo
export const uploadCoverPhoto = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const userId = req.user!.id;
  const filename = req.file.filename;
  const fileUrl = getFileUrl(filename, 'covers');

  try {
    // Get current cover picture to delete old one
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { coverPicture: true }
    });

    // Update user cover picture
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { coverPicture: fileUrl },
      select: {
        id: true,
        username: true,
        coverPicture: true
      }
    });

    // Delete old cover picture if it exists and is a local file
    if (currentUser?.coverPicture && currentUser.coverPicture.startsWith('/api/files/covers/')) {
      const oldFilename = path.basename(currentUser.coverPicture);
      const oldFilePath = path.join(__dirname, '../../uploads/covers', oldFilename);
      try {
        await deleteFile(oldFilePath);
      } catch (error) {
        console.warn('Failed to delete old cover picture:', error);
      }
    }

    successResponse(res, {
      user: updatedUser,
      file: {
        filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    }, 201, 'Cover photo uploaded successfully');

  } catch (error) {
    // Clean up uploaded file if database update fails
    try {
      await deleteFile(req.file.path);
    } catch (cleanupError) {
      console.error('Failed to cleanup uploaded file:', cleanupError);
    }
    throw error;
  }
};

// Upload post image
export const uploadPostImage = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const filename = req.file.filename;
  const fileUrl = getFileUrl(filename, 'posts');

  successResponse(res, {
    file: {
      filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    }
  }, 201, 'Post image uploaded successfully');
};

// Upload resume
export const uploadResume = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const filename = req.file.filename;
  const fileUrl = getFileUrl(filename, 'resumes');

  successResponse(res, {
    file: {
      filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    }
  }, 201, 'Resume uploaded successfully');
};

// Upload event image
export const uploadEventImage = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const filename = req.file.filename;
  const fileUrl = getFileUrl(filename, 'events');

  successResponse(res, {
    file: {
      filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    }
  }, 201, 'Event image uploaded successfully');
};