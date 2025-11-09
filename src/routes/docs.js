/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - mobileNumber
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         mobileNumber:
 *           type: string
 *           description: User's mobile number
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         stateId:
 *           type: integer
 *         cityId:
 *           type: integer
 *         address:
 *           type: string
 *         pincode:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, medical_staff]
 *         specialization:
 *           type: string
 *         experience:
 *           type: integer
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 * 
 * /api/registration/register:
 *   post:
 *     tags:
 *       - Registration
 *     summary: Register a new user
 *     description: Create a new user account with personal and professional details
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               stateId:
 *                 type: integer
 *                 example: 1
 *               cityId:
 *                 type: integer
 *                 example: 1
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               pincode:
 *                 type: string
 *                 example: "560001"
 *               role:
 *                 type: string
 *                 enum: [user, admin, medical_staff]
 *               specialization:
 *                 type: string
 *                 example: "Cardiology"
 *               experience:
 *                 type: integer
 *                 example: 5
 *               profilePic:
 *                 type: string
 *                 format: binary
 *               certificate:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "User registered successfully!"
 *               data:
 *                 id: 1
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 * 
 * /api/registration/check-email:
 *   post:
 *     tags:
 *       - Registration
 *     summary: Check email availability
 *     description: Check if an email address is already registered
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email availability check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 * 
 * /api/registration/cities/{stateId}:
 *   get:
 *     tags:
 *       - Registration
 *     summary: Get cities by state
 *     description: Retrieve list of cities for a given state ID
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the state
 *     responses:
 *       200:
 *         description: List of cities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                     count:
 *                       type: integer
 */

// Export an empty object as this file is only for documentation
module.exports = {};