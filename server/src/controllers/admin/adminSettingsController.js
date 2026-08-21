import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';

export const defaultSettings = {
    homepage_hero_slides: JSON.stringify([
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1599643478524-fb5244dc6eb4?q=80&w=1600&auto=format&fit=crop',
            title: 'Handcrafted Elegance',
            subtitle: 'Discover jewelry designed with intention and crafted by master artisans.',
            cta: 'Explore Collection',
            link: '/shop'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1600&auto=format&fit=crop',
            title: 'The Terracotta Collection',
            subtitle: 'Earthy tones and warm metals, perfect for the modern minimalist.',
            cta: 'Shop New Arrivals',
            link: '/shop'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?q=80&w=1600&auto=format&fit=crop',
            title: 'Rooted in Tradition',
            subtitle: 'Every piece tells a story of heritage, skill, and passion.',
            cta: 'Our Craft Story',
            link: '/about'
        }
    ]),
    homepage_brand_story: JSON.stringify({
        background_text: 'Artisanal',
        heading_normal: 'The Art of',
        heading_italic: 'Craft',
        description: 'We believe that true luxury lies in the details. Every piece of MalkinCraft jewelry begins its journey in the hands of master artisans who have spent decades perfecting their craft. From selecting ethically sourced materials to the final polish, our process honors traditional techniques while embracing modern design.',
        button_text: 'Read Our Story',
        button_link: '/about',
        image: 'https://images.unsplash.com/photo-1620050843105-06d91d0637c3?q=80&w=800&auto=format&fit=crop',
        badge_top: 'Established',
        badge_bottom: 'Jaipur, India'
    }),
    homepage_newsletter: JSON.stringify({
        image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?q=80&w=800&auto=format&fit=crop',
        heading_normal: 'Join the',
        heading_italic: 'Inner Circle',
        description: 'Subscribe to receive updates on new arrivals, special offers, and our latest stories.'
    })
};

export const getSettings = async (req, res, next) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        // Inject defaults
        if (!settingsObj.homepage_hero_slides) settingsObj.homepage_hero_slides = defaultSettings.homepage_hero_slides;
        if (!settingsObj.homepage_brand_story) settingsObj.homepage_brand_story = defaultSettings.homepage_brand_story;
        if (!settingsObj.homepage_newsletter) settingsObj.homepage_newsletter = defaultSettings.homepage_newsletter;

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

export const resetSettings = async (req, res, next) => {
    try {
        const upsertPromises = Object.keys(defaultSettings).map(key => {
            return prisma.setting.upsert({
                where: { key },
                update: { value: defaultSettings[key] },
                create: { key, value: defaultSettings[key] }
            });
        });

        await Promise.all(upsertPromises);
        return successResponse(res, { message: 'Homepage settings reset to defaults' });
    } catch (error) {
        next(error);
    }
};

export const uploadSettingImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, { message: 'No image provided', statusCode: 400 });
        }
        const result = await uploadToCloudinary(req.file.buffer, 'settings');
        return successResponse(res, { data: { url: result.secure_url }, message: 'Image uploaded successfully' });
    } catch (error) {
        next(error);
    }
};
