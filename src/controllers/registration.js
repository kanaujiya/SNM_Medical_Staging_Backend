const registrationService = require('../services/registration');
const { sendResponse, sendSuccess, sendError } = require('../utils/response');

exports.getDropdownData = async (req, res) => {
  try {
    const data = await registrationService.getDropdownData();
    sendResponse(res, 200, true, 'Dropdown data fetched successfully', data);
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

exports.getCities = async (req, res) => {
  const { stateId } = req.params;
  if (!stateId || isNaN(stateId) || Number(stateId) <= 0) {
    return sendResponse(res, 400, false, 'Valid state ID is required');
  }

  try {
    const cities = await registrationService.getCitiesByState(stateId);
    const message = cities.length ? 'Cities fetched successfully' : 'No cities found';
    sendResponse(res, 200, true, message, { cities, count: cities.length });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendResponse(res, 400, false, 'Email is required');

  try {
    const exists = await registrationService.checkEmailExists(email);
    const message = exists ? 'Email already exists' : 'Email available';
    sendResponse(res, 200, true, message, { exists });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

exports.registerUser = async (req, res) => {
  try {
    const files = req.files || {};
    const userData = req.body || {};

    // Debug log
    console.log('Registration Data:', {
      body: userData,
      files: Object.keys(files),
      contentType: req.headers['content-type']
    });

    // Basic validation
    if (!userData || Object.keys(userData).length === 0) {
      return sendResponse(res, 400, false, 'No registration data provided');
    }

    // Build file paths
    const filePaths = {
      profileImagePath: files?.profilePic?.[0]
        ? `/uploads/profile/${files.profilePic[0].filename}`
        : null,
      certificatePath: files?.certificate?.[0]
        ? `/uploads/certificates/${files.certificate[0].filename}`
        : null
    };

    const result = await registrationService.createUser(userData, filePaths);

    return sendResponse(res, 201, true, 'User registered successfully!', result);
  } catch (error) {
    console.error('Registration Error:', error);
    const statusCode = /registered/i.test(error.message) ? 409 : 500;
    return sendResponse(res, statusCode, false, error.message || 'User registration failed');
  }
};