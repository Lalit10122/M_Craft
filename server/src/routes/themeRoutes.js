import express from 'express';
import { getPublicTheme } from '../controllers/admin/themeController.js';

const router = express.Router();

router.get('/', getPublicTheme);

export default router;
