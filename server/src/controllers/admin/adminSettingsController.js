import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const getSettings = async (req, res, next) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return successResponse(res, { data: settingsObj, message: 'Settings retrieved successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateSetting = async (req, res, next) => {
    try {
        const { key, value } = req.body;
        if (!key) return errorResponse(res, { message: 'Key is required', statusCode: 400 });

        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });

        await prisma.auditLog.create({
            data: {
                action: 'SETTING_UPDATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Setting',
                targetId: key,
                metadata: { key, value },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: setting, message: 'Setting updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const getPincodes = async (req, res, next) => {
    try {
        const pincodes = await prisma.serviceablePincode.findMany();
        return successResponse(res, { data: pincodes, message: 'Pincodes retrieved successfully' });
    } catch (error) {
        next(error);
    }
};

export const addPincode = async (req, res, next) => {
    try {
        const { pincode, estimatedDays, codAvailable } = req.body;
        if (!pincode) return errorResponse(res, { message: 'Pincode is required', statusCode: 400 });

        const newPincode = await prisma.serviceablePincode.create({
            data: { pincode, estimatedDays, codAvailable }
        });

        return successResponse(res, { data: newPincode, message: 'Pincode added successfully', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const bulkUploadPincodes = async (req, res, next) => {
    try {
        const { pincodes } = req.body;
        if (!Array.isArray(pincodes)) {
            return errorResponse(res, { message: 'pincodes must be an array', statusCode: 400 });
        }

        const result = await prisma.serviceablePincode.createMany({
            data: pincodes.map(p => ({
                pincode: p.pincode,
                estimatedDays: p.estimatedDays,
                codAvailable: p.codAvailable
            })),
            skipDuplicates: true
        });

        return successResponse(res, { data: result, message: `${result.count} pincodes added successfully`, statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const deletePincode = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.serviceablePincode.delete({ where: { id } });
        return successResponse(res, { message: 'Pincode deleted successfully' });
    } catch (error) {
        next(error);
    }
};
