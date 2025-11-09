const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const userController = require('../controllers/userController');

/**
 * @swagger
 * /api/user/update-role:
 *   put:
 *     tags: [User Management]
 *     summary: Update user role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: number
 *               isPresent:
 *                 type: boolean
 *               passEntry:
 *                 type: boolean
 *               isDeleted:
 *                 type: boolean
 *               isAdmin:
 *                 type: boolean
 *               remark:
 *                 type: string
 *               sewaLocationId:
 *                 type: number
 *               samagamHeldIn:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/update-role',
  authenticateToken,
  userController.addUserRole
);

module.exports = router;
