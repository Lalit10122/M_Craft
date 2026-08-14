import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const checkDelivery = async (req, res, next) => {
  try {
    const { pincode } = req.query;
    if (!pincode || pincode.length !== 6) {
      return errorResponse(res, { statusCode: 400, message: 'Valid 6-digit pincode is required' });
    }

    const record = await prisma.serviceablePincode.findUnique({ where: { pincode } });
    if (record) {
      let sameDayAvailable = false;
      const cutoffSetting = await prisma.setting.findUnique({ where: { key: 'same_day_cutoff_hour' } });
      if (cutoffSetting && !isNaN(cutoffSetting.value)) {
         const currentHour = new Date().getHours();
         if (currentHour < parseInt(cutoffSetting.value, 10)) {
            sameDayAvailable = true;
         }
      }

      return successResponse(res, { data: { serviceable: true, estimatedDays: record.estimatedDays, codAvailable: record.codAvailable, sameDayAvailable } });
    } else {
      return successResponse(res, { data: { serviceable: false, estimatedDays: null, codAvailable: false, sameDayAvailable: false } });
    }
  } catch (error) {
    next(error);
  }
};
