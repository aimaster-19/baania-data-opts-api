import { Router } from 'express'
import {
  createUnittype,
  getUnittypes,
  getUnittypeById,
  updateUnittype,
  deleteUnittype
} from '../controllers/unittypeController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.post('/add', protect, createUnittype)
router.get('/list', protect, getUnittypes)
router.get('/id/:id', protect, getUnittypeById)
router.put('/update/:id', protect, updateUnittype)
router.delete('/delete/:id', protect, deleteUnittype)

export default router
