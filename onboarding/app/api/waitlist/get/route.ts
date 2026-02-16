// Import necessary modules
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db'; // Adjust the path as needed

// Define the GET handler
export async function GET(req: NextRequest) {
  try {
    // Create a connection to the database
    const connection = await pool.getConnection();

    // Perform the query to get data from the waitlist
    const [rows] = await connection.query('SELECT * FROM waitlist') as [Record<string, any>[], any];

    // Release the connection
    connection.release();

    // Check if there are any records
    if (rows.length === 0) {
      return NextResponse.json({ message: 'No records found' }, { status: 404 });
    }

    // Return the records
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('GET API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
