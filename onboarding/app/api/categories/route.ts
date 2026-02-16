import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db'; // Adjust the path if needed

export async function GET(req: NextRequest) {
  try {
    const [categories] = await pool.query('SELECT id, name FROM categories') as [Record<string, any>[], any];
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
