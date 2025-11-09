// This file contains all the Swagger documentation for your API endpoints

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 *   - name: Registration
 *     description: User registration and related operations
 *   - name: Dashboard
 *     description: Dashboard related operations
 *   - name: Search
 *     description: Search functionality
 *   - name: DutyChart
 *     description: Medical staff duty chart operations
 *   - name: Reports
 *     description: Report generation and management
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *     RegistrationRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - mobileNumber
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: "Password123!"
 *         mobileNumber:
 *           type: string
 *           pattern: "^[0-9]{10}$"
 *           example: "9876543210"
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *           example: Male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         stateId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         cityId:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         address:
 *           type: string
 *           maxLength: 200
 *           example: "123 Main Street"
 *         pincode:
 *           type: string
 *           pattern: "^[0-9]{6}$"
 *           example: "560001"
 *         role:
 *           type: string
 *           enum: [user, admin, medical_staff]
 *           example: medical_staff
 *         specialization:
 *           type: string
 *           example: "Cardiology"
 *         experience:
 *           type: integer
 *           minimum: 0
 *           example: 5
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Authenticate user and return JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 * /api/registration/register:
 *   post:
 *     tags: [Registration]
 *     summary: Register new user
 *     description: Create a new user account with profile details
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - mobileNumber
 *               - role
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
 *                 example: Password123!
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               stateId:
 *                 type: integer
 *               cityId:
 *                 type: integer
 *               address:
 *                 type: string
 *               pincode:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, medical_staff]
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: integer
 *               profilePic:
 *                 type: string
 *                 format: binary
 *               certificate:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 * 
 * /api/registration/check-email:
 *   post:
 *     tags: [Registration]
 *     summary: Check email availability
 *     description: Check if an email is already registered
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Email check successful
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
 *       400:
 *         description: Invalid email format
 *       500:
 *         description: Server error
 * 
 * /api/registration/cities/{stateId}:
 *   get:
 *     tags: [Registration]
 *     summary: Get cities by state
 *     description: Get list of cities for a given state ID
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the state to get cities for
 *         example: 1
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
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
 *       400:
 *         description: Invalid state ID
 *       404:
 *         description: State not found
 *       500:
 *         description: Server error
 */