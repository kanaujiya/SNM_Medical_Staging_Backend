const mysql = require('mysql2');

// Create connection pool with correct MySQL2 options
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'snm-dispensary.c6n262qos6l8.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '5FJPD564gQjOuVckTdrk',
  database: process.env.DB_NAME || 'snm_dispensary',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('MySQL Database connected successfully to snm_dispensary');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Database query test successful');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Handle pool events for better monitoring
pool.on('connection', (connection) => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = {
  pool,
  promisePool,
  testConnection
};
