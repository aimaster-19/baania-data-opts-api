import { Router } from 'express';
import {
  createProjectRead,
  getProjectReads,
  getProjectReadById,
  updateProjectRead,
  deleteProjectRead
} from '../controllers/projectReadController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Setup CRUD routes
router.post('/add', protect, createProjectRead);
router.get('/list', protect, getProjectReads);
router.get('/id/:id', protect, getProjectReadById);
router.put('/update/:id', protect, updateProjectRead);
router.delete('/delete/:id', protect, deleteProjectRead);

export default router;
