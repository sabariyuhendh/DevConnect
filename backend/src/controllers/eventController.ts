import { Request, Response } from 'express';
import prisma from '../../prisma/client';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/errors';
import { getParamAsString } from '../utils/helpers';

// Get events with filtering and pagination
export const getEvents = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    type,
    format,
    location,
    startDate,
    endDate,
    search,
    sortBy = 'startDate',
    sortOrder = 'asc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const whereClause: any = {
    status: 'PUBLISHED',
    isPublic: true,
    startDate: { gte: new Date() } // Only future events by default
  };

  if (type) {
    whereClause.type = type;
  }

  if (format) {
    whereClause.format = format;
  }

  if (location) {
    whereClause.OR = [
      { location: { contains: location as string, mode: 'insensitive' } },
      { venue: { contains: location as string, mode: 'insensitive' } },
      { address: { contains: location as string, mode: 'insensitive' } }
    ];
  }

  if (startDate) {
    whereClause.startDate = { gte: new Date(startDate as string) };
  }

  if (endDate) {
    whereClause.endDate = { lte: new Date(endDate as string) };
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { tags: { has: search as string } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.event.count({ where: whereClause });

  // Fetch events
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      organizer: {
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
          attendees: true,
          waitlist: true
        }
      }
    },
    orderBy: { [sortBy as string]: sortOrder },
    take: Number(limit),
    skip
  });

  const totalPages = Math.ceil(total / Number(limit));

  successResponse(
    res,
    events,
    200,
    'Events fetched',
    {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  );
};

// Get single event
export const getEvent = async (req: Request, res: Response) => {
  const eventId = getParamAsString(req.params.id);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          company: true
        }
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          }
        },
        where: { status: 'REGISTERED' }
      },
      _count: {
        select: {
          attendees: true,
          waitlist: true
        }
      }
    }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Increment view count
  await prisma.event.update({
    where: { id: eventId },
    data: { viewCount: { increment: 1 } }
  });

  successResponse(res, event, 200, 'Event fetched');
};

// Create event
export const createEvent = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    description,
    startDate,
    endDate,
    timezone,
    location,
    venue,
    address,
    type,
    format,
    category,
    tags,
    price,
    currency,
    maxAttendees,
    waitlistEnabled,
    imageUrl,
    bannerUrl,
    websiteUrl,
    streamUrl,
    requirements,
    agenda,
    speakers,
    isPublic,
    requiresApproval
  } = req.body;

  if (!title || !description || !startDate || !endDate) {
    throw new AppError('Missing required fields', 400);
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new AppError('End date must be after start date', 400);
  }

  if (start < new Date()) {
    throw new AppError('Start date must be in the future', 400);
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      startDate: start,
      endDate: end,
      timezone: timezone || 'UTC',
      location,
      venue,
      address,
      type: type || 'MEETUP',
      format: format || 'IN_PERSON',
      category,
      tags: tags || [],
      price: price || 0,
      currency: currency || 'USD',
      maxAttendees,
      waitlistEnabled: waitlistEnabled || false,
      imageUrl,
      bannerUrl,
      websiteUrl,
      streamUrl,
      requirements,
      agenda,
      speakers,
      isPublic: isPublic !== false, // Default to true
      requiresApproval: requiresApproval || false,
      status: 'PUBLISHED', // Auto-publish for now
      organizerId: userId
    },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  successResponse(res, event, 201, 'Event created successfully');
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const eventId = getParamAsString(req.params.id);

  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!existingEvent) {
    throw new AppError('Event not found', 404);
  }

  if (existingEvent.organizerId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...req.body,
      updatedAt: new Date()
    },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  successResponse(res, event, 200, 'Event updated successfully');
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const eventId = getParamAsString(req.params.id);

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.organizerId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.event.delete({
    where: { id: eventId }
  });

  successResponse(res, null, 200, 'Event deleted successfully');
};

// RSVP to event
export const rsvpToEvent = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const eventId = getParamAsString(req.params.id);
  const { rsvpResponse, dietaryReqs } = req.body;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: { attendees: true }
      }
    }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status !== 'PUBLISHED') {
    throw new AppError('Event is not available for registration', 400);
  }

  if (event.startDate < new Date()) {
    throw new AppError('Cannot RSVP to past events', 400);
  }

  // Check if already registered
  const existingRsvp = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId: eventId,
        userId
      }
    }
  });

  if (existingRsvp) {
    throw new AppError('You have already registered for this event', 400);
  }

  // Check capacity
  if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
    if (event.waitlistEnabled) {
      // Add to waitlist
      const waitlistEntry = await prisma.eventWaitlist.create({
        data: {
          eventId: eventId,
          userId
        }
      });
      
      successResponse(res, { waitlisted: true, entry: waitlistEntry }, 201, 'Added to waitlist');
      return;
    } else {
      throw new AppError('Event is full and waitlist is not enabled', 400);
    }
  }

  // Create RSVP
  const rsvp = await prisma.eventAttendee.create({
    data: {
      eventId: eventId,
      userId,
      rsvpResponse,
      dietaryReqs
    }
  });

  // Update attendee count
  await prisma.event.update({
    where: { id: eventId },
    data: { currentAttendees: { increment: 1 } }
  });

  successResponse(res, rsvp, 201, 'RSVP successful');
};

// Cancel RSVP
export const cancelRsvp = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const eventId = getParamAsString(req.params.id);

  const rsvp = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId: eventId,
        userId
      }
    }
  });

  if (!rsvp) {
    throw new AppError('RSVP not found', 404);
  }

  await prisma.eventAttendee.delete({
    where: { id: rsvp.id }
  });

  // Update attendee count
  await prisma.event.update({
    where: { id: eventId },
    data: { currentAttendees: { decrement: 1 } }
  });

  // Check waitlist and promote someone
  const waitlistEntry = await prisma.eventWaitlist.findFirst({
    where: { eventId: eventId },
    orderBy: { joinedAt: 'asc' }
  });

  if (waitlistEntry) {
    // Move from waitlist to attendees
    await prisma.eventAttendee.create({
      data: {
        eventId: eventId,
        userId: waitlistEntry.userId
      }
    });

    await prisma.eventWaitlist.delete({
      where: { id: waitlistEntry.id }
    });

    // Update attendee count
    await prisma.event.update({
      where: { id: eventId },
      data: { currentAttendees: { increment: 1 } }
    });

    // TODO: Send notification to promoted user
  }

  successResponse(res, null, 200, 'RSVP cancelled');
};

// Get user's events (organized)
export const getMyEvents = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const events = await prisma.event.findMany({
    where: { organizerId: userId },
    include: {
      _count: {
        select: {
          attendees: true,
          waitlist: true
        }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  successResponse(res, events, 200, 'My events fetched');
};

// Get user's RSVPs
export const getMyRsvps = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const rsvps = await prisma.eventAttendee.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          organizer: {
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
    orderBy: { registeredAt: 'desc' }
  });

  successResponse(res, rsvps, 200, 'My RSVPs fetched');
};

// Get event attendees (organizer only)
export const getEventAttendees = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const eventId = getParamAsString(req.params.id);

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.organizerId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const attendees = await prisma.eventAttendee.findMany({
    where: { eventId: eventId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePicture: true
        }
      }
    },
    orderBy: { registeredAt: 'asc' }
  });

  successResponse(res, attendees, 200, 'Event attendees fetched');
};
