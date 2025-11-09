const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const path = require('path');
const registrationController = require('../controllers/registration');
const formData = new FormData();

/**
 * @swagger
 * /dropdown-data:
 *   get:
 *     tags:
 *       - Registration
 *     summary: Get dropdown data (states, departments, qualifications)
 *     description: Retrieve all dropdown master data used in registration forms.
 *     responses:
 *       200:
 *         description: Successfully fetched dropdown data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 states: [{ id: 1, name: "Karnataka" }]
 *                 departments: [{ id: 1, name: "Cardiology" }]
 *                 qualifications: [{ id: 1, name: "MBBS" }]
 *       500:
 *         description: Internal server error
 */

router.get('/dropdown-data', registrationController.getDropdownData);
router.get('/cities/:stateId', registrationController.getCities);
router.post('/check-email', registrationController.checkEmail);

router.post(
  '/register',
  upload.fields([
    { name: 'profilePic', maxCount: 1 }, 
    { name: 'certificate', maxCount: 1 },
  ]),
  registrationController.registerUser
);

router.post('/upload-profile', upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No profile image uploaded',
    });
  }

  const filePath = `/uploads/profile/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Profile image uploaded successfully',
    filePath,
  });
});

router.post('/upload-certificate', upload.single('certificate'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No certificate uploaded',
    });
  }

  const filePath = `/uploads/certificates/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Certificate uploaded successfully',
    filePath,
  });
});

module.exports = router;
