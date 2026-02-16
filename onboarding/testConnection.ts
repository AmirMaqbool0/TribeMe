import pool from './lib/db'; // Import the connection pool from your db.ts

async function testConnection() {
  try {
    const connection = await pool.getConnection(); // Get a connection from the pool
    console.log('Connected to the MySQL database successfully!');

    // You can test a simple query if you'd like
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query result:', rows);

    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error);
  }
}

testConnection();
