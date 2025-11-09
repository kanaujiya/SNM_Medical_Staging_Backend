// src/controllers/auth.controller.js
const authService = require('../services/auth');
const { sendResponse } = require('../utils/response');

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    sendResponse(res, 200, true, 'Login successful', result);
  } catch (error) {
    const status =
      /permission/i.test(error.message) || /invalid/i.test(error.message)
        ? 401
        : 500;
    sendResponse(res, status, false, error.message);
  }
};


/**
 * Step 1: Forgot password validation
 */
exports.validateForgotPassword = async (req, res) => {
  try {
    const result = await authService.validateForgotPassword(req.body);
    sendResponse(res, 200, result.success, result.message, result.data);
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
};

/**
 * Step 2: Reset Password
 */
exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    sendResponse(res, 200, result.success, result.message, result.data || null);
  } catch (error) {
    sendResponse(res, 400, false, error.message);
  }
};

