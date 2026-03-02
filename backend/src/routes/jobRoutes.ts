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
router.patch('/admin/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status === 'APPROVED') {
      return jobController.approveJob(req, res);
    } else if (status === 'REJECTED') {
      return jobController.rejectJob(req, res);
    }
    res.status(400).json({ message: 'Invalid status' });
  } catch (error) {
    next(error);
  }
});

export default router;
