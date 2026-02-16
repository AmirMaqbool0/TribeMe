// File: app/api/waitlist/route.ts
// Endpoint: GET /api/waitlist

// import { NextRequest, NextResponse } from 'next/server';
// import pool from '@/lib/db';  // Update this path according to your db configuration
// import { RowDataPacket } from 'mysql2/promise';

// interface Brand extends RowDataPacket {
//   id: number;
//   name: string;
//   email: string;
//   contact_number: string;
//   address: string;
//   zip_code: string;
//   status: string;
//   source: string;
// }

// export async function GET(req: NextRequest) {
//   let connection;

//   try {
//     connection = await pool.getConnection();

//     const query = `
//       (
//         SELECT 
//           id,
//           businessName as name,
//           businessEmail as email,
//           phoneNumber as contact_number,
//           address,
//           zipCode as zip_code,
//           status,
//           'business' as source
//         FROM business_waitlist
//       )
//       UNION ALL
//       (
//         SELECT 
//           id,
//           CONCAT(firstName, ' ', lastName) as name,
//           businessEmail as email,
//           phoneNumber as contact_number,
//           address,
//           zipCode as zip_code,
//           status,
//           'member' as source
//         FROM member_waitlist
//       )
//       ORDER BY id DESC
//     `;

//     const [rows] = await connection.execute<Brand[]>(query);

//     if (!rows.length) {
//       return NextResponse.json(
//         { message: 'No records found' }, 
//         { status: 404 }
//       );
//     }

//     const brands = rows.map(row => ({
//       id: row.id,
//       name: row.name,
//       email: row.email,
//       contact_number: row.contact_number,
//       address: row.address,
//       zip_code: row.zip_code,
//       status: row.status,
//       source: row.source
//     }));

//     return NextResponse.json({
//       total: brands.length,
//       data: brands,
//       business_count: brands.filter(b => b.source === 'business').length,
//       member_count: brands.filter(b => b.source === 'member').length
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Get Waitlist API Error:', error);
//     return NextResponse.json(
//       { error: 'An error occurred while fetching records' }, 
//       { status: 500 }
//     );

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';  // Update this path according to your db configuration
import { RowDataPacket } from 'mysql2/promise';

interface Business extends RowDataPacket {
  id: number;
  firstName: string;
  lastName: string;
  businessEmail: string;
  contact_number: string;
  address: string;
  zip_code: string;
  status: string;
}

export async function GET(req: NextRequest) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Query to get records from only the `business_waitlist`
    const query = `
      SELECT 
        id,
        firstName,
        lastName,
        businessEmail,
        phoneNumber as contact_number,
        address,
        zipCode as zip_code,
        status
      FROM business_waitlist
      ORDER BY id DESC
    `;

    const [rows] = await connection.execute<Business[]>(query);

    if (!rows.length) {
      return NextResponse.json(
        { message: 'No records found' }, 
        { status: 404 }
      );
    }

    // Formatting the response to match the requested structure
    const businesses = rows.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      businessEmail: row.businessEmail,
      contact_number: row.contact_number,
      address: row.address,
      zip_code: row.zip_code,
      status: row.status,
    }));

    return NextResponse.json({
      total: businesses.length,
      data: businesses
    }, { status: 200 });

  } catch (error) {
    console.error('Get Business Waitlist API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching records' }, 
      { status: 500 }
    );

  } finally {
    if (connection) {
      connection.release();
    }
  }
}
