
require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-default-secret-key-for-development',
  expiresIn: '1h'
};

module.exports = jwtConfig;
