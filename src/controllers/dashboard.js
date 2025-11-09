const dashboardService = require('../services/dashboard');
const { sendResponse } = require('../utils/response');

exports.getStats = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardStats(req.user.userId);
    sendResponse(res, 200, true, 'Dashboard statistics fetched successfully', data);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await dashboardService.getUserProfile(req.user.userId);
    sendResponse(res, 200, true, 'Profile fetched successfully', profile);
  } catch (error) {
    sendResponse(res, error.message.includes('not found') ? 404 : 500, false, error.message);
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const result = await dashboardService.getAllUsers(req.query);
//     sendResponse(res, 200, true, 'Users fetched successfully', result);
//   } catch (error) {
//     sendResponse(res, 500, false, error.message);
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    await dashboardService.updateUserProfile(req.user.userId, req.body);
    sendResponse(res, 200, true, 'Profile updated successfully');
  } catch (error) {
    const status = /taken|not found/i.test(error.message) ? 409 : 500;
    sendResponse(res, status, false, error.message);
  }
};

exports.updatePresence = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isPresent, passEntry } = req.body;
    await dashboardService.updateUserPresence(userId, isPresent, passEntry);
    sendResponse(res, 200, true, 'User presence updated successfully');
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    sendResponse(res, status, false, error.message);
  }
};

exports.getAdminSummary = async (req, res) => {
  try {
    const summary = await dashboardService.getAdminSummary();
    sendResponse(res, 200, true, 'Admin summary fetched successfully', summary);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
