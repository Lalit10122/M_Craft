import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

// DEFAULT THEME
const DEFAULT_THEME = {
  primaryColor: "#000000",
  secondaryColor: "#6b7a62",
  accentColor: "#d9a036",
  backgroundColor: "#fdfbf7",
  textColor: "#2c2c2c",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
  buttonStyle: "rounded",
  logoUrl: null
};

// PRESETS
const PRESETS = [
  { 
    name: "Classic Gold", 
    primaryColor: "#B8860B", 
    secondaryColor: "#556B2F", 
    accentColor: "#DAA520", 
    backgroundColor: "#FFFAF0", 
    textColor: "#2F4F4F",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    buttonStyle: "sharp"
  },
  { 
    name: "Rose Blush", 
    primaryColor: "#DDA0DD", 
    secondaryColor: "#FFB6C1", 
    accentColor: "#FF69B4", 
    backgroundColor: "#FFF0F5", 
    textColor: "#4B0082",
    headingFont: "Lora",
    bodyFont: "Open Sans",
    buttonStyle: "pill"
  },
  { 
    name: "Minimal Mono", 
    primaryColor: "#000000", 
    secondaryColor: "#333333", 
    accentColor: "#666666", 
    backgroundColor: "#FFFFFF", 
    textColor: "#000000",
    headingFont: "Inter",
    bodyFont: "Inter",
    buttonStyle: "sharp"
  },
  { 
    name: "Emerald Luxe", 
    primaryColor: "#004B49", 
    secondaryColor: "#2E8B57", 
    accentColor: "#D4AF37", 
    backgroundColor: "#F5FFFA", 
    textColor: "#002120",
    headingFont: "Playfair Display",
    bodyFont: "Montserrat",
    buttonStyle: "rounded"
  }
];

// In-Memory Cache
let themeCache = null;
let cacheExpiry = 0;

export const getPublicTheme = async (req, res, next) => {
  try {
    if (themeCache && Date.now() < cacheExpiry) {
      return successResponse(res, { data: themeCache });
    }

    let theme = await prisma.themeSettings.findFirst();
    if (!theme) {
      theme = DEFAULT_THEME;
    }

    themeCache = theme;
    cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

    return successResponse(res, { data: theme });
  } catch (error) {
    next(error);
  }
};

export const getAdminTheme = async (req, res, next) => {
  try {
    let theme = await prisma.themeSettings.findFirst();
    if (!theme) {
      theme = DEFAULT_THEME;
    }
    return successResponse(res, { data: { currentTheme: theme, presets: PRESETS } });
  } catch (error) {
    next(error);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    const { presetName, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, headingFont, bodyFont, buttonStyle, logoUrl } = req.body;
    
    // Validate HEX
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i;
    if (!hexRegex.test(primaryColor) || !hexRegex.test(secondaryColor) || !hexRegex.test(accentColor) || !hexRegex.test(backgroundColor) || !hexRegex.test(textColor)) {
      return errorResponse(res, { statusCode: 400, message: "Invalid hex color format." });
    }

    // Validate Fonts
    const allowedHeadingFonts = ['Playfair Display', 'Lora', 'Montserrat', 'Inter'];
    const allowedBodyFonts = ['Inter', 'Open Sans', 'Roboto', 'Montserrat'];
    if (!allowedHeadingFonts.includes(headingFont) || !allowedBodyFonts.includes(bodyFont)) {
      return errorResponse(res, { statusCode: 400, message: "Invalid font selection." });
    }

    const data = {
      presetName: presetName || null,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      headingFont,
      bodyFont,
      buttonStyle,
      logoUrl: logoUrl || null,
      updatedByAdminId: req.user?.id
    };

    let theme = await prisma.themeSettings.findFirst();
    if (theme) {
      theme = await prisma.themeSettings.update({
        where: { id: theme.id },
        data
      });
    } else {
      theme = await prisma.themeSettings.create({
        data
      });
    }

    // Clear Cache
    themeCache = null;

    return successResponse(res, { message: "Theme updated successfully", data: theme });
  } catch (error) {
    next(error);
  }
};

export const resetTheme = async (req, res, next) => {
  try {
    let theme = await prisma.themeSettings.findFirst();
    
    const data = {
      ...DEFAULT_THEME,
      presetName: null,
      updatedByAdminId: req.user?.id
    };

    if (theme) {
      theme = await prisma.themeSettings.update({
        where: { id: theme.id },
        data
      });
    } else {
      theme = await prisma.themeSettings.create({
        data
      });
    }

    // Clear Cache
    themeCache = null;

    return successResponse(res, { message: "Theme reset to default successfully", data: theme });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, { statusCode: 400, message: 'No file uploaded' });
    }

    // Reuse existing upload utility (multer/S3)
    const logoUrl = req.file.path || req.file.location;
    return successResponse(res, { data: { logoUrl } });
  } catch (error) {
    next(error);
  }
};
