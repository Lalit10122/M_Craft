export const successResponse = (res, arg1, arg2, arg3) => {
  if (typeof arg1 === 'string') {
    return res.status(arg3 || 200).json({ success: true, message: arg1, data: arg2 });
  }
  const { data = null, message = 'Success', statusCode = 200 } = arg1 || {};
  return res.status(statusCode).json({ success: true, data, message });
};

export const errorResponse = (res, arg1, arg2) => {
  if (typeof arg1 === 'string' || Array.isArray(arg1)) {
    const message = typeof arg1 === 'string' ? arg1 : 'Validation Error';
    const errors = Array.isArray(arg1) ? arg1 : [];
    const statusCode = arg2 || 500;
    return res.status(statusCode).json({ success: false, message, errors });
  }
  const { message = 'Something went wrong', statusCode = 500, errors = [] } = arg1 || {};
  return res.status(statusCode).json({ success: false, message, errors });
};
