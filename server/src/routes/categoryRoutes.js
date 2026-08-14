import { Router } from 'express';
import { listCategories, getCategoryAttributes } from '../controllers/categoryController.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id/attributes', getCategoryAttributes);

export default router;
