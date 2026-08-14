import { Router } from 'express';
import { listCollections, getCollectionBySlug } from '../controllers/collectionController.js';

const router = Router();

router.get('/', listCollections);
router.get('/:slug', getCollectionBySlug);

export default router;
