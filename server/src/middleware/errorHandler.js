import { errorResponse } from '../utils/apiResponse.js';
import { ZodError } from 'zod';

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    return errorResponse(res, { message: `Unique constraint failed on field: ${err.meta?.target}`, statusCode: 409 });
  }
  if (err.code === 'P2025') {
    return errorResponse(res, { message: 'Record not found', statusCode: 404 });
  }
  if (err.code === 'P2003') {
    return errorResponse(res, { message: 'Foreign key constraint failed', statusCode: 400 });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, { message: 'Invalid or expired token', statusCode: 401 });
  }

  // Zod Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, { message: 'Validation Error', statusCode: 400, errors: formattedErrors });
  }

  // Multer Errors
  if (err.name === 'MulterError' || (err.message && err.message.includes('multer'))) {
    return errorResponse(res, { message: err.message, statusCode: 400 });
  }

  // Default Error
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return errorResponse(res, {
    message,
    statusCode: err.statusCode || 500,
    errors: process.env.NODE_ENV === 'development' ? err.stack : [],
  });
};

export default errorHandler;
