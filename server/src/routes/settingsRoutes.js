import { Router } from 'express';
import { prisma } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

router.get('/public', async (req, res, next) => {
    try {
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: ['global_banner_config'] // only expose specific public settings
                }
            }
        });
        
        const settingsObj = settings.reduce((acc, curr) => {
            try {
                acc[curr.key] = JSON.parse(curr.value);
            } catch {
                acc[curr.key] = curr.value;
            }
            return acc;
        }, {});
        
        return successResponse(res, { data: settingsObj, message: 'Public settings retrieved successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
