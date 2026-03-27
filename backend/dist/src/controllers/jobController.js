"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectJob = exports.approveJob = exports.getPendingJobs = exports.getSavedJobs = exports.getMyApplications = exports.toggleSaveJob = exports.applyToJob = exports.deleteJob = exports.updateJob = exports.createJob = exports.getJob = exports.getJobs = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const apiResponse_1 = require("../utils/apiResponse");
const errors_1 = require("../utils/errors");
// Get jobs with lazy loading (infinite scroll)
const getJobs = async (req, res) => {
    const { page = 1, limit = 10, location, locationType, employmentType, experienceLevel, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // Build where clause
    const whereClause = {
        status: 'APPROVED',
        isVerified: true,
        OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
        ]
    };
    if (location) {
        whereClause.location = { contains: location, mode: 'insensitive' };
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
            { title: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    // Get total count for pagination
    const total = await client_1.default.job.count({ where: whereClause });
    // Fetch jobs
    const jobs = await client_1.default.job.findMany({
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
        orderBy: { [sortBy]: sortOrder },
        take: Number(limit),
        skip
    });
    const totalPages = Math.ceil(total / Number(limit));
    const hasMore = Number(page) < totalPages;
    (0, apiResponse_1.successResponse)(res, jobs, 200, 'Jobs fetched', {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages
    });
};
exports.getJobs = getJobs;
// Get single job
const getJob = async (req, res) => {
    const { id } = req.params;
    const job = await client_1.default.job.findUnique({
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
        throw new errors_1.AppError('Job not found', 404);
    }
    // Increment view count
    await client_1.default.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
    });
    (0, apiResponse_1.successResponse)(res, job, 200, 'Job fetched');
};
exports.getJob = getJob;
// Create job (requires approval)
const createJob = async (req, res) => {
    const userId = req.user.id;
    const { title, company, companyLogo, location, locationType, employmentType, experienceLevel, description, requirements, responsibilities, skills, benefits, salaryMin, salaryMax, salaryCurrency, salaryPeriod, applicationUrl, applicationEmail, applyType, expiresAt } = req.body;
    if (!title || !company || !location || !description) {
        throw new errors_1.AppError('Missing required fields', 400);
    }
    const job = await client_1.default.job.create({
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
    (0, apiResponse_1.successResponse)(res, job, 201, 'Job created and pending approval');
};
exports.createJob = createJob;
// Update job
const updateJob = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const existingJob = await client_1.default.job.findUnique({
        where: { id }
    });
    if (!existingJob) {
        throw new errors_1.AppError('Job not found', 404);
    }
    if (existingJob.postedById !== userId) {
        throw new errors_1.AppError('Unauthorized', 403);
    }
    const job = await client_1.default.job.update({
        where: { id },
        data: {
            ...req.body,
            status: 'PENDING', // Reset to pending after edit
            isVerified: false
        }
    });
    (0, apiResponse_1.successResponse)(res, job, 200, 'Job updated and pending re-approval');
};
exports.updateJob = updateJob;
// Delete job
const deleteJob = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const job = await client_1.default.job.findUnique({
        where: { id }
    });
    if (!job) {
        throw new errors_1.AppError('Job not found', 404);
    }
    if (job.postedById !== userId) {
        throw new errors_1.AppError('Unauthorized', 403);
    }
    await client_1.default.job.delete({
        where: { id }
    });
    (0, apiResponse_1.successResponse)(res, null, 200, 'Job deleted');
};
exports.deleteJob = deleteJob;
// Apply to job
const applyToJob = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { coverLetter, resumeUrl, portfolioUrl, linkedinUrl, githubUrl } = req.body;
    const job = await client_1.default.job.findUnique({
        where: { id }
    });
    if (!job) {
        throw new errors_1.AppError('Job not found', 404);
    }
    if (job.status !== 'APPROVED') {
        throw new errors_1.AppError('Job is not available for applications', 400);
    }
    // Check if already applied
    const existingApplication = await client_1.default.jobApplication.findUnique({
        where: {
            jobId_userId: {
                jobId: id,
                userId
            }
        }
    });
    if (existingApplication) {
        throw new errors_1.AppError('You have already applied to this job', 400);
    }
    const application = await client_1.default.jobApplication.create({
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
    await client_1.default.job.update({
        where: { id },
        data: { applicationCount: { increment: 1 } }
    });
    (0, apiResponse_1.successResponse)(res, application, 201, 'Application submitted');
};
exports.applyToJob = applyToJob;
// Save/unsave job
const toggleSaveJob = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const existingSave = await client_1.default.savedJob.findUnique({
        where: {
            jobId_userId: {
                jobId: id,
                userId
            }
        }
    });
    if (existingSave) {
        await client_1.default.savedJob.delete({
            where: { id: existingSave.id }
        });
        (0, apiResponse_1.successResponse)(res, { saved: false }, 200, 'Job unsaved');
    }
    else {
        await client_1.default.savedJob.create({
            data: {
                jobId: id,
                userId
            }
        });
        (0, apiResponse_1.successResponse)(res, { saved: true }, 200, 'Job saved');
    }
};
exports.toggleSaveJob = toggleSaveJob;
// Get user's applications
const getMyApplications = async (req, res) => {
    const userId = req.user.id;
    const applications = await client_1.default.jobApplication.findMany({
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
    (0, apiResponse_1.successResponse)(res, applications, 200, 'Applications fetched');
};
exports.getMyApplications = getMyApplications;
// Get saved jobs
const getSavedJobs = async (req, res) => {
    const userId = req.user.id;
    const savedJobs = await client_1.default.savedJob.findMany({
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
    (0, apiResponse_1.successResponse)(res, savedJobs, 200, 'Saved jobs fetched');
};
exports.getSavedJobs = getSavedJobs;
// ============================================
// ADMIN ROUTES
// ============================================
// Get pending jobs (admin only)
const getPendingJobs = async (req, res) => {
    const jobs = await client_1.default.job.findMany({
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
    (0, apiResponse_1.successResponse)(res, jobs, 200, 'Pending jobs fetched');
};
exports.getPendingJobs = getPendingJobs;
// Approve job (admin only)
const approveJob = async (req, res) => {
    const adminId = req.user.id;
    const { id } = req.params;
    const job = await client_1.default.job.update({
        where: { id },
        data: {
            status: 'APPROVED',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: adminId
        }
    });
    (0, apiResponse_1.successResponse)(res, job, 200, 'Job approved');
};
exports.approveJob = approveJob;
// Reject job (admin only)
const rejectJob = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const job = await client_1.default.job.update({
        where: { id },
        data: {
            status: 'REJECTED'
        }
    });
    // TODO: Send notification to poster with reason
    (0, apiResponse_1.successResponse)(res, job, 200, 'Job rejected');
};
exports.rejectJob = rejectJob;
