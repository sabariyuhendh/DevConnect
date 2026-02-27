import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';

// Get jobs with lazy loading (infinite scroll)
export const getJobs = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    location,
    locationType,
    employmentType,
    experienceLevel,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const whereClause: any = {
    status: 'APPROVED',
    isVerified: true,
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } }
    ]
  };

  if (location) {
    whereClause.location = { contains: location as string, mode: 'insensitive' };
  }

  if (locationType) {
    whereClause.locationType = locationType;
  }

  if (employmentType) {
    whereClause.employmentType = employmentType;
  }

  if (experienceLevel) {
    whereClause.experienceLevel = experienceLevel;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { company: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.job.count({ where: whereClause });

  // Fetch jobs
  const jobs = await prisma.job.findMany({
    where: whereClause,
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true
        }
      },
      _count: {
        select: {
          applications: true,
          savedBy: true
        }
      }
    },
    orderBy: { [sortBy as string]: sortOrder },
    take: Number(limit),
    skip
  });

  const totalPages = Math.ceil(total / Number(limit));
  const hasMore = Number(page) < totalPages;

  successResponse(
    res,
    jobs,
    200,
    'Jobs fetched',
    {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasMore
    }
  );
};

// Get single job
export const getJob = async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          company: true
        }
      },
      _count: {
        select: {
          applications: true,
          savedBy: true
        }
      }
    }
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Increment view count
  await prisma.job.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  });

  successResponse(res, job, 200, 'Job fetched');
};

// Create job (requires approval)
export const createJob = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    company,
    companyLogo,
    location,
    locationType,
    employmentType,
    experienceLevel,
    description,
    requirements,
    responsibilities,
    skills,
    benefits,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    applicationUrl,
    applicationEmail,
    applyType,
    expiresAt
  } = req.body;

  if (!title || !company || !location || !description) {
    throw new AppError('Missing required fields', 400);
  }

  const job = await prisma.job.create({
    data: {
      title,
      company,
      companyLogo,
      location,
      locationType: locationType || 'ONSITE',
      employmentType: employmentType || 'FULL_TIME',
      experienceLevel: experienceLevel || 'MID_LEVEL',
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      benefits: benefits || [],
      salaryMin,
      salaryMax,
      salaryCurrency: salaryCurrency || 'USD',
      salaryPeriod: salaryPeriod || 'YEARLY',
      applicationUrl,
      applicationEmail,
      applyType: applyType || 'INTERNAL',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      postedById: userId,
      status: 'PENDING' // Requires admin approval
    },
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  successResponse(res, job, 201, 'Job created and pending approval');
};

// Update job
export const updateJob = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingJob = await prisma.job.findUnique({
    where: { id }
  });

  if (!existingJob) {
    throw new AppError('Job not found', 404);
  }

  if (existingJob.postedById !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...req.body,
      status: 'PENDING', // Reset to pending after edit
      isVerified: false
    }
  });

  successResponse(res, job, 200, 'Job updated and pending re-approval');
};

// Delete job
export const deleteJob = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id }
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.postedById !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.job.delete({
    where: { id }
  });

  successResponse(res, null, 200, 'Job deleted');
};

// Apply to job
export const applyToJob = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { coverLetter, resumeUrl, portfolioUrl, linkedinUrl, githubUrl } = req.body;

  const job = await prisma.job.findUnique({
    where: { id }
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.status !== 'APPROVED') {
    throw new AppError('Job is not available for applications', 400);
  }

  // Check if already applied
  const existingApplication = await prisma.jobApplication.findUnique({
    where: {
      jobId_userId: {
        jobId: id,
        userId
      }
    }
  });

  if (existingApplication) {
    throw new AppError('You have already applied to this job', 400);
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: id,
      userId,
      coverLetter,
      resumeUrl,
      portfolioUrl,
      linkedinUrl,
      githubUrl
    }
  });

  // Increment application count
  await prisma.job.update({
    where: { id },
    data: { applicationCount: { increment: 1 } }
  });

  successResponse(res, application, 201, 'Application submitted');
};

// Save/unsave job
export const toggleSaveJob = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingSave = await prisma.savedJob.findUnique({
    where: {
      jobId_userId: {
        jobId: id,
        userId
      }
    }
  });

  if (existingSave) {
    await prisma.savedJob.delete({
      where: { id: existingSave.id }
    });
    successResponse(res, { saved: false }, 200, 'Job unsaved');
  } else {
    await prisma.savedJob.create({
      data: {
        jobId: id,
        userId
      }
    });
    successResponse(res, { saved: true }, 200, 'Job saved');
  }
};

// Get user's applications
export const getMyApplications = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          postedBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { appliedAt: 'desc' }
  });

  successResponse(res, applications, 200, 'Applications fetched');
};

// Get saved jobs
export const getSavedJobs = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: {
          postedBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { savedAt: 'desc' }
  });

  successResponse(res, savedJobs, 200, 'Saved jobs fetched');
};

// ============================================
// ADMIN ROUTES
// ============================================

// Get pending jobs (admin only)
export const getPendingJobs = async (req: Request, res: Response) => {
  const jobs = await prisma.job.findMany({
    where: { status: 'PENDING' },
    include: {
      postedBy: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  successResponse(res, jobs, 200, 'Pending jobs fetched');
};

// Approve job (admin only)
export const approveJob = async (req: Request, res: Response) => {
  const adminId = req.user!.id;
  const { id } = req.params;

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: 'APPROVED',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: adminId
    }
  });

  successResponse(res, job, 200, 'Job approved');
};

// Reject job (admin only)
export const rejectJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: 'REJECTED'
    }
  });

  // TODO: Send notification to poster with reason

  successResponse(res, job, 200, 'Job rejected');
};

export {};
