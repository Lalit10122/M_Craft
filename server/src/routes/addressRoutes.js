import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addressController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
