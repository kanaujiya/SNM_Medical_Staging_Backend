
/**
 * Send a standardized API response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g., 200, 400, 500)
 * @param {boolean} success - Whether the request succeeded
 * @param {string} message - Response message
 * @param {object} [data={}] - Optional response data
 */
exports.sendResponse = (res, statusCode = 200, success = true, message = '', data = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && Object.keys(data).length > 0 && { data }),
  });
};
