import { Router } from 'express';
import { getBoxBuilderConfig } from '../controllers/public/boxBuilderController.js';

const router = Router();

router.get('/:slug', getBoxBuilderConfig);

export default router;
