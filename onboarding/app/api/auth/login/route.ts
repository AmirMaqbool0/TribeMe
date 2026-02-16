import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Import your database connection
import { RowDataPacket } from 'mysql2';

// Define the interface for your user
interface User extends RowDataPacket {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password } = await request.json();

    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Connect to the database
    const connection = await pool.getConnection();
    

    try {
      // Query to find the user by email
      const [rows] = await connection.execute<User[]>('SELECT * FROM users WHERE businessEmail = ?', [email]);

      // Check if user was found
      if (rows.length > 0) {
        const user = rows[0];

        // Check if the password matches
        if (user.password === password) {
          // Passwords match, login successful
          const redirectUrl = new URL('/Welcome', request.url); // Correctly construct the URL
          return NextResponse.redirect(redirectUrl);
        } else {
          // Passwords do not match
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
      } else {
        // No user found with the provided email
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
