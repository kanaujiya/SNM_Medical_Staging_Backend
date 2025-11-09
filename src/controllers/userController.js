const userService = require('../services/userService');
const { sendResponse } = require('../utils/response');

exports.addUserRole = async (req, res) => {
  try {
    const {
      regId,
      isPresent,
      passEntry,
      isDeleted,
      isAdmin,
      remark,
      sewaLocationId,
      samagamHeldIn
    } = req.body;

    if (!regId) {
      return sendResponse(res, 400, false, 'Registration ID is required.');
    }

    // Convert regId to string if it's an array
    const regIdString = Array.isArray(regId) ? regId.join(',') : regId.toString();

    const data = await userService.addUserRole({
      regId: regIdString,
      isPresent,
      passEntry,
      isDeleted,
      isAdmin,
      remark,
      sewaLocationId,
      samagamHeldIn
    });

    sendResponse(res, 200, true, data.message, data);
  } catch (error) {
    console.error('❌ approve Controller Error:', error);
    sendResponse(res, 500, false, 'Failed to update user role');
  }
};
