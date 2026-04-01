import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getUserConnections,
  getPendingRequests,
  getSentRequests,
  getConnectionStatus,
  searchUsers
} from '../controllers/connectionController';

const router = Router();

// All routes require authentication
router.use(protect);

// Connection management
router.post('/request/:userId', sendConnectionRequest);
router.put('/accept/:connectionId', acceptConnectionRequest);
router.put('/decline/:connectionId', declineConnectionRequest);
router.delete('/:connectionId', removeConnection);

// Get connections and requests
router.get('/', getUserConnections);
router.get('/pending', getPendingRequests);
router.get('/sent', getSentRequests);
router.get('/status/:userId', getConnectionStatus);

// Search for users to connect with
router.get('/search', searchUsers);

export default router;