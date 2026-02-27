import { Router } from 'express';
import { protect } from '../middleware/auth';
import { authenticateSSE } from '../middleware/sseAuth';
import * as postController from '../controllers/postController';
import * as feedSSEController from '../controllers/feedSSEController';

const router = Router();

// SSE endpoint for real-time updates (uses query param auth due to EventSource limitations)
router.get('/feed/stream', authenticateSSE, feedSSEController.feedSSE);

// All other routes require standard authentication
router.use(protect);

// Post CRUD
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/publish', postController.publishDraft);

// Feed
router.get('/feed', postController.getFeed);
router.get('/drafts', postController.getDrafts);

// Interactions
router.post('/:id/like', postController.likePost);
router.post('/:id/bookmark', postController.bookmarkPost);

// Recommendations
router.get('/recommendations/connections', postController.getConnectionRecommendations);

export default router;
