import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db'; // Adjust the path if needed

export async function GET(
  req: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  const { categoryId } = params;

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  try {
    const [subcategories] = await pool.query(
      'SELECT id, name FROM subcategories WHERE category_id = ?',
      [categoryId]
    ) as [Record<string, any>[], any];
    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}