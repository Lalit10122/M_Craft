import { errorResponse } from '../utils/apiResponse.js';

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
};

export { authorizeAdmin };
