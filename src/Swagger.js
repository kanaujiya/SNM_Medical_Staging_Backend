const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'SNM Medical API',
    description: 'API documentation for SNM Medical application',
    version: '1.0.0',
    contact: {
      name: 'SNM Medical Team',
      email: 'support@snmmedical.com'
    }
  },
  host: 'localhost:5000',
  basePath: '/api',
  schemes: ['http', 'https'],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your bearer token in the format "Bearer {token}"'
    }
  },
  definitions: {
    User: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'email',
        'password',
        'mobileNumber',
        'role'
      ],
      properties: {
        firstName: { 
          type: 'string', 
          example: 'John',
          minLength: 2,
          maxLength: 50
        },
        lastName: { 
          type: 'string', 
          example: 'Doe',
          minLength: 2,
          maxLength: 50
        },
        email: { 
          type: 'string', 
          format: 'email',
          example: 'john.doe@example.com' 
        },
        password: { 
          type: 'string', 
          format: 'password',
          example: 'Password123!',
          minLength: 8
        },
        mobileNumber: { 
          type: 'string', 
          example: '9876543210',
          pattern: '^[0-9]{10}$'
        },
        gender: { 
          type: 'string', 
          enum: ['Male', 'Female', 'Other'] 
        },
        dateOfBirth: { 
          type: 'string', 
          format: 'date', 
          example: '1990-01-01' 
        },
        stateId: { 
          type: 'integer', 
          example: 1,
          minimum: 1
        },
        cityId: { 
          type: 'integer', 
          example: 1,
          minimum: 1
        },
        address: { 
          type: 'string', 
          example: '123 Main St',
          maxLength: 200
        },
        pincode: { 
          type: 'string', 
          example: '560001',
          pattern: '^[0-9]{6}$'
        },
        role: { 
          type: 'string', 
          enum: ['user', 'admin', 'medical_staff'] 
        },
        specialization: { 
          type: 'string', 
          example: 'Cardiology' 
        },
        experience: { 
          type: 'integer', 
          example: 5,
          minimum: 0
        }
      }
    },
    LoginCredentials: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'password123' }
      }
    },
    RegistrationResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User registered successfully!' },
        data: { $ref: '#/definitions/User' }
      }
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Error message here' }
      }
    }
  }
};

const outputFile = './swagger-output.json';

const routes = [
  './src/routes/swagger.docs.js',  // Main API documentation
  './src/routes/registration.js',
  './src/routes/auth.js', 
  './src/routes/dashboard.js', 
  './src/routes/search.js', 
  './src/routes/dutychart.js', 
  './src/routes/reports.js'
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

// Generate swagger documentation
swaggerAutogen(outputFile, routes, doc).then(() => {
    console.log('Swagger documentation generated successfully');
    // Optionally require and run your server here
    // require('./server.js');
});