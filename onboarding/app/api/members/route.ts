import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Adjust the path if needed
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed (npm i bcrypt)

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phoneNumber, password } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Check if email or phone number already exists
    const [rows] = await connection.query(
      'SELECT * FROM members WHERE email = ? OR phoneNumber = ?',
      [email, phoneNumber]
    ) as [Record<string, any>[], any];

    if (Array.isArray(rows) && rows.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'User with this email or phone number already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new member into the database
    await connection.query(
      'INSERT INTO members (firstName, lastName, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phoneNumber, hashedPassword]
    );

    connection.release();
    return NextResponse.json({ message: 'Successfully registered!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
