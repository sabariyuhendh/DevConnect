import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as eventController from '../controllers/eventController';

const router = Router();

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

// Protected routes
router.use(protect);

router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// RSVP routes
router.post('/:id/rsvp', eventController.rsvpToEvent);
router.delete('/:id/rsvp', eventController.cancelRsvp);

// User's events
router.get('/my/events', eventController.getMyEvents);
router.get('/my/rsvps', eventController.getMyRsvps);

// Event management (organizer only)
router.get('/:id/attendees', eventController.getEventAttendees);

export default router;
