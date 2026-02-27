import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as jobController from '../controllers/jobController';

const router = Router();

// Public routes
router.get('/', jobController.getJobs); // Lazy loading with pagination
router.get('/:id', jobController.getJob);

// Protected routes
router.use(protect);

router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.post('/:id/apply', jobController.applyToJob);
router.post('/:id/save', jobController.toggleSaveJob);
router.get('/my/applications', jobController.getMyApplications);
router.get('/my/saved', jobController.getSavedJobs);

// Admin routes (TODO: Add admin middleware)
router.get('/admin/pending', jobController.getPendingJobs);
router.post('/admin/:id/approve', jobController.approveJob);
router.post('/admin/:id/reject', jobController.rejectJob);

export default router;
