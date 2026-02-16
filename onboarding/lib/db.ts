// import mysql from 'mysql2/promise';

// // Create a connection pool to the MySQL database
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',          // Replace with your MySQL username
//   password: '',  // Replace with your MySQL password
//   database: 'tribeme',   // Your database name
// });

// // // Create a connection pool to the MySQL database
// // const pool = mysql.createPool({
// //   host: '107.180.119.179',         // Replace with your MySQL host (in cPanel, this could be different)
// //   user: 'user001',      // Replace with your cPanel MySQL username
// //   password: 'tribemeadmin1', // Replace with your cPanel MySQL password
// //   database: 'tribeme',       // Your database name in cPanel
// //   waitForConnections: true,
// //   connectionLimit: 10,       // You can adjust this value as needed
// //   queueLimit: 0,
// // });

// export default pool;

// db.ts
// import mysql from 'mysql2/promise';

// // Create a connection pool to the MySQL database
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'tribeme',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// export default pool;

// // Add this type declaration if you're using TypeScript
// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       DB_HOST: string;
//       DB_USER: string;
//       DB_PASSWORD: string;
//       DB_NAME: string;
//     }
//   }
// }

// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// // Load environment variables from .env.local file
// dotenv.config();

// // Create a connection pool to the MySQL database
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'tribeme',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// export default pool;

// import { createPool } from 'mysql2/promise'; // Named import for mysql2/promise
// import * as dotenv from 'dotenv'; // Use this for correct import

// dotenv.config(); // This correctly calls the config method


// // Create a connection pool to the MySQL database
// const pool = createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 5,  // Adjust based on your requirements
//   queueLimit: 0,
// });

// export default pool;

import { createPool } from 'mysql2/promise'; // Change this line

// Create a connection pool to the MySQL database with direct credentials
const pool = createPool({
  host: process.env.DB_HOST,       // Your database host
  user: process.env.DB_USER,               // Your database user
  password: process.env.DB_PASSWORD,     // Your database password
  database: 'tribeme',           // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// Add this type declaration if you're using TypeScript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
    }
  }
}

