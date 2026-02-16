// import { NextRequest, NextResponse } from 'next/server'; // Import NextResponse as a value
// import pool from '../../../../lib/db'; // Adjust the path if needed

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       firstName,
//       lastName,
//       businessName,
//       phoneNumber,
//       businessEmail,
//       city,
//       category,
//       subCategory,
//       address,
//       zipCode,
//     } = await req.json();

//     if (!firstName || !lastName || !businessEmail || !phoneNumber || !city || !address || !zipCode) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     const connection = await pool.getConnection();

//     // Check if a record with the same email or phone number exists
//     const [rows] = await connection.query(
//       'SELECT * FROM waitlist WHERE businessEmail = ? OR phoneNumber = ?',
//       [businessEmail, phoneNumber]
//     ) as [Record<string, any>[], any];

//     if (Array.isArray(rows) && rows.length > 0) {
//       connection.release();
//       return NextResponse.json({ error: 'User with this email or phone number already exists' }, { status: 409 });
//     }

//     // Insert new record
//     await connection.query(
//       'INSERT INTO waitlist (firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode]
//     );

//     connection.release();
//     return NextResponse.json({ message: 'Successfully added to the waitlist!' }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from 'next/server'; // Import NextResponse as a value
// import pool from '../../../../lib/db'; // Adjust the path if needed

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       firstName,
//       lastName,
//       businessName, // If businessName exists, the request is from a business.
//       phoneNumber,
//       businessEmail,
//       city,
//       category,
//       subCategory,
//       address,
//       zipCode,
//     } = await req.json();

//     // Allowed zip codes for Tribe Me BETA Launch in Boulder, Colorado
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306', // Boulder
//       '80026', // Lafayette
//       '80027', // Louisville
//       '80020', '80021', '80023', '80234', // Broomfield
//       '80466', // Nederland
//       '80503', // Niwot
//       '80501', '80504' // Longmont
//     ];

//     // Basic field validation
//     if (!firstName || !lastName || !businessEmail || !phoneNumber || !city || !address || !zipCode) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(businessEmail)) {
//       return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
//     }

//     // Phone number validation (simple example, adjust for your specific format)
//     const phoneRegex = /^\d{10,15}$/; // Adjust based on your phone number requirements
//     if (!phoneRegex.test(phoneNumber)) {
//       return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
//     }

//     const connection = await pool.getConnection();

//     // If the zip code is NOT allowed, add the user to the appropriate waitlist (business or member)
//     if (!allowedZipCodes.includes(zipCode)) {
//       if (businessName) {
//         // If businessName is present, it's a business, add to business waitlist
//         await connection.query(
//           'INSERT INTO business_waitlist (firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//           [firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode]
//         );
//         connection.release();
//         return NextResponse.json({ message: "Your business is outside the supported area but has been added to the waitlist for future launches." }, { status: 200 });
//       } else {
//         // Add to the member waitlist
//         await connection.query(
//           'INSERT INTO member_waitlist (firstName, lastName, phoneNumber, businessEmail, city, address, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?)',
//           [firstName, lastName, phoneNumber, businessEmail, city, address, zipCode]
//         );
//         connection.release();
//         return NextResponse.json({ message: "You are outside the supported area but have been added to the waitlist for future launches." }, { status: 200 });
//       }
//     }

//     // Check if a record with the same email or phone number exists in the waitlist
//     const [rows] = await connection.query(
//       'SELECT * FROM waitlist WHERE businessEmail = ? OR phoneNumber = ?',
//       [businessEmail, phoneNumber]
//     ) as [Record<string, any>[], any];

//     if (Array.isArray(rows) && rows.length > 0) {
//       connection.release();
//       return NextResponse.json({ error: 'User with this email or phone number already exists' }, { status: 409 });
//     }

//     // Insert new record for the initial BETA launch
//     await connection.query(
//       'INSERT INTO waitlist (firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [firstName, lastName, businessName, phoneNumber, businessEmail, city, category, subCategory, address, zipCode]
//     );

//     connection.release();
//     return NextResponse.json({ message: 'Successfully joined the Tribe Me BETA Launch!' }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import pool from '../../../../lib/db';
// import { RowDataPacket } from 'mysql2/promise';

// // Define interfaces for type safety
// interface WaitlistRequest {
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   phoneNumber: string;
//   businessEmail: string;
//   city: string;
//   category?: string;
//   subCategory?: string;
//   address: string;
//   zipCode: string;
// }

// export async function POST(req: NextRequest) {
//   let connection;

//   try {
//     const data = await req.json() as WaitlistRequest;
    
//     // Allowed zip codes
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306', // Boulder
//       '80026', // Lafayette
//       '80027', // Louisville
//       '80020', '80021', '80023', '80234', // Broomfield
//       '80466', // Nederland
//       '80503', // Niwot
//       '80501', '80504' // Longmont
//     ];

//     // Required field validation
//     const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'businessEmail', 'city', 'address', 'zipCode'];
//     for (const field of requiredFields) {
//       if (!data[field as keyof WaitlistRequest]) {
//         return NextResponse.json({ error: `${field} is required` }, { status: 400 });
//       }
//     }

//     connection = await pool.getConnection();

//     // Check for existing user
//     const [existingUsers] = await connection.execute<RowDataPacket[]>(
//       'SELECT id FROM waitlist WHERE businessEmail = ? OR phoneNumber = ?',
//       [data.businessEmail, data.phoneNumber]
//     );

//     if (existingUsers.length > 0) {
//       return NextResponse.json({ 
//         error: 'A user with this email or phone number already exists' 
//       }, { status: 409 });
//     }

//     // Determine if the zip code is in the allowed list
//     const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);
//     const targetTable = isAllowedZipCode ? 'waitlist' : 
//       (data.businessName ? 'business_waitlist' : 'member_waitlist');

//     // Prepare query based on table
//     let query: string;
//     let values: any[];

//     if (targetTable === 'member_waitlist') {
//       query = `
//         INSERT INTO member_waitlist 
//         (firstName, lastName, phoneNumber, businessEmail, city, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.address,
//         data.zipCode
//       ];
//     } else {
//       query = `
//         INSERT INTO ${targetTable}
//         (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
//          category, subCategory, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.businessName || null,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.category || null,
//         data.subCategory || null,
//         data.address,
//         data.zipCode
//       ];
//     }

//     await connection.execute(query, values);

//     // Prepare response message
//     let message: string;
//     if (isAllowedZipCode) {
//       message = 'Successfully joined the Tribe Me BETA Launch!';
//     } else if (data.businessName) {
//       message = 'Your business is outside our current service area but has been added to the waitlist for future launches.';
//     } else {
//       message = 'You are outside our current service area but have been added to the waitlist for future launches.';
//     }

//     return NextResponse.json({ message }, { status: 200 });

//   } catch (error) {
//     console.error('Waitlist API Error:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while processing your request' 
//     }, { status: 500 });

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import pool from '../../../../lib/db';
// import { RowDataPacket } from 'mysql2/promise';

// interface WaitlistRequest {
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   phoneNumber: string;
//   businessEmail: string;
//   city: string;
//   category?: string;
//   subCategory?: string;
//   address: string;
//   zipCode: string;
// }

// export async function POST(req: NextRequest) {
//   let connection;

//   try {
//     const data = await req.json() as WaitlistRequest;
    
//     // Allowed zip codes remain the same
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306',
//       '80026', '80027', '80020', '80021', '80023', '80234',
//       '80466', '80503', '80501', '80504'
//     ];

//     // Required field validation remains the same
//     const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'businessEmail', 'city', 'address', 'zipCode'];
//     for (const field of requiredFields) {
//       if (!data[field as keyof WaitlistRequest]) {
//         return NextResponse.json({ error: `${field} is required` }, { status: 400 });
//       }
//     }

//     connection = await pool.getConnection();

//     // Updated duplicate check across all tables
//     const [existingUsers] = await connection.execute<RowDataPacket[]>(
//       `SELECT 'waitlist' as source FROM waitlist WHERE businessEmail = ? OR phoneNumber = ?
//        UNION ALL
//        SELECT 'business_waitlist' as source FROM business_waitlist WHERE businessEmail = ? OR phoneNumber = ?
//        UNION ALL
//        SELECT 'member_waitlist' as source FROM member_waitlist WHERE businessEmail = ? OR phoneNumber = ?`,
//       [
//         data.businessEmail, data.phoneNumber,
//         data.businessEmail, data.phoneNumber,
//         data.businessEmail, data.phoneNumber
//       ]
//     );

//     if (existingUsers.length > 0) {
//       return NextResponse.json({ 
//         error: 'A user with this email or phone number already exists in our system' 
//       }, { status: 409 });
//     }

//     // Determine target table based on zip code and business status
//     const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);
//     const targetTable = isAllowedZipCode ? 'waitlist' : 
//       (data.businessName ? 'business_waitlist' : 'member_waitlist');

//     // Rest of the code remains the same
//     let query: string;
//     let values: any[];

//     if (targetTable === 'member_waitlist') {
//       query = `
//         INSERT INTO member_waitlist 
//         (firstName, lastName, phoneNumber, businessEmail, city, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.address,
//         data.zipCode
//       ];
//     } else {
//       query = `
//         INSERT INTO ${targetTable}
//         (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
//          category, subCategory, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.businessName || null,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.category || null,
//         data.subCategory || null,
//         data.address,
//         data.zipCode
//       ];
//     }

//     await connection.execute(query, values);

//     let message: string;
//     if (isAllowedZipCode) {
//       message = 'Successfully joined the Tribe Me BETA Launch!';
//     } else if (data.businessName) {
//       message = 'Your business is outside our current service area but has been added to the waitlist for future launches.';
//     } else {
//       message = 'You are outside our current service area but have been added to the waitlist for future launches.';
//     }

//     return NextResponse.json({ message }, { status: 200 });

//   } catch (error) {
//     console.error('Waitlist API Error:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while processing your request' 
//     }, { status: 500 });

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import pool from '../../../../lib/db';
// import { RowDataPacket } from 'mysql2/promise';

// interface WaitlistRequest {
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   phoneNumber: string;
//   businessEmail: string;
//   city: string;
//   category?: string;
//   subCategory?: string;
//   address: string;
//   zipCode: string;
//   termsAgreed: boolean;  // New field for checkbox validation
// }

// export async function POST(req: NextRequest) {
//   let connection;

//   try {
//     const data = await req.json() as WaitlistRequest;

//     // Check if terms are agreed
//     if (!data.termsAgreed) {
//       return NextResponse.json({ 
//         error: 'You must agree to the Terms of Service and Privacy Policy' 
//       }, { status: 400 });
//     }

//     // Allowed zip codes
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306',
//       '80026', '80027', '80020', '80021', '80023', '80234',
//       '80466', '80503', '80501', '80504'
//     ];

//     // Determine if the zip code is allowed
//     const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);

//     connection = await pool.getConnection();

//     // Duplicate check based on allowed zip code
//     let duplicateCheckQuery;
//     let duplicateCheckValues = [data.businessEmail, data.phoneNumber];

//     if (isAllowedZipCode) {
//       // Check only in `business_waitlist`
//       duplicateCheckQuery = `
//         SELECT 'business_waitlist' as source FROM business_waitlist 
//         WHERE businessEmail = ? OR phoneNumber = ?
//       `;
//     } else {
//       // Check only in `member_waitlist`
//       duplicateCheckQuery = `
//         SELECT 'member_waitlist' as source FROM member_waitlist 
//         WHERE businessEmail = ? OR phoneNumber = ?
//       `;
//     }

//     const [existingUsers] = await connection.execute<RowDataPacket[]>(duplicateCheckQuery, duplicateCheckValues);

//     if (existingUsers.length > 0) {
//       return NextResponse.json({ 
//         error: 'A user with this email or phone number already exists in our system' 
//       }, { status: 409 });
//     }

//     // Determine target table based on allowed zip code and business status
//     const targetTable = isAllowedZipCode ? 'business_waitlist' : 'member_waitlist';

//     // Insert data based on target table
//     let query: string;
//     let values: any[];

//     if (targetTable === 'member_waitlist') {
//       query = `
//         INSERT INTO member_waitlist 
//         (firstName, lastName, phoneNumber, businessEmail, city, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.address,
//         data.zipCode
//       ];
//     } else {
//       query = `
//         INSERT INTO business_waitlist
//         (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
//          category, subCategory, address, zipCode) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.businessName || null,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.category || null,
//         data.subCategory || null,
//         data.address,
//         data.zipCode
//       ];
//     }

//     await connection.execute(query, values);

//     let message: string;
//     if (isAllowedZipCode) {
//       message = 'Successfully joined the Tribe Me BETA Launch!';
//     } else if (data.businessName) {
//       message = 'Your business is outside our current service area but has been added to the waitlist for future launches.';
//     } else {
//       message = 'You are outside our current service area but have been added to the waitlist for future launches.';
//     }

//     return NextResponse.json({ message }, { status: 200 });

//   } catch (error) {
//     console.error('Waitlist API Error:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while processing your request' 
//     }, { status: 500 });

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import pool from '../../../../lib/db';
// import { RowDataPacket } from 'mysql2/promise';

// interface WaitlistRequest {
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   phoneNumber: string;
//   businessEmail: string;
//   city: string;
//   category?: string;
//   subCategory?: string;
//   address: string;
//   zipCode: string;
//   termsAgreed: boolean;
// }

// export async function POST(req: NextRequest) {
//   let connection;

//   try {
//     const data = await req.json() as WaitlistRequest;

//     // Check if terms are agreed
//     if (!data.termsAgreed) {
//       return NextResponse.json({ 
//         error: 'You must agree to the Terms of Service and Privacy Policy' 
//       }, { status: 400 });
//     }

//     // Allowed zip codes
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306',
//       '80026', '80027', '80020', '80021', '80023', '80234',
//       '80466', '80503', '80501', '80504'
//     ];

//     // Determine if the zip code is allowed and set status
//     const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);
//     const status = isAllowedZipCode ? 'available' : 'not available';

//     connection = await pool.getConnection();

//     // Duplicate check based on allowed zip code
//     let duplicateCheckQuery;
//     let duplicateCheckValues = [data.businessEmail, data.phoneNumber];

//     if (isAllowedZipCode) {
//       // Check only in `business_waitlist`
//       duplicateCheckQuery = `
//         SELECT 'business_waitlist' as source FROM business_waitlist 
//         WHERE businessEmail = ? OR phoneNumber = ?
//       `;
//     } else {
//       // Check only in `member_waitlist`
//       duplicateCheckQuery = `
//         SELECT 'member_waitlist' as source FROM member_waitlist 
//         WHERE businessEmail = ? OR phoneNumber = ?
//       `;
//     }

//     const [existingUsers] = await connection.execute<RowDataPacket[]>(duplicateCheckQuery, duplicateCheckValues);

//     if (existingUsers.length > 0) {
//       return NextResponse.json({ 
//         error: 'A user with this email or phone number already exists in our system' 
//       }, { status: 409 });
//     }

//     // Determine target table based on allowed zip code and business status
//     const targetTable = isAllowedZipCode ? 'business_waitlist' : 'member_waitlist';

//     // Insert data based on target table
//     let query: string;
//     let values: any[];

//     if (targetTable === 'member_waitlist') {
//       query = `
//         INSERT INTO member_waitlist 
//         (firstName, lastName, phoneNumber, businessEmail, city, address, zipCode, status) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.address,
//         data.zipCode,
//         status
//       ];
//     } else {
//       query = `
//         INSERT INTO business_waitlist
//         (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
//          category, subCategory, address, zipCode, status) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;
//       values = [
//         data.firstName,
//         data.lastName,
//         data.businessName || null,
//         data.phoneNumber,
//         data.businessEmail,
//         data.city,
//         data.category || null,
//         data.subCategory || null,
//         data.address,
//         data.zipCode,
//         status
//       ];
//     }

//     await connection.execute(query, values);

//     let message: string;
//     if (isAllowedZipCode) {
//       message = 'Successfully joined the Tribe Me BETA Launch!';
//     } else if (data.businessName) {
//       message = 'Your business is outside our current service area but has been added to the waitlist for future launches.';
//     } else {
//       message = 'You are outside our current service area but have been added to the waitlist for future launches.';
//     }

//     return NextResponse.json({ message, status }, { status: 200 });

//   } catch (error) {
//     console.error('Waitlist API Error:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while processing your request' 
//     }, { status: 500 });

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }
// import { NextRequest, NextResponse } from 'next/server';
// import pool from '../../../../lib/db';
// import { RowDataPacket } from 'mysql2/promise';

// interface WaitlistRequest {
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   phoneNumber: string;
//   businessEmail: string;
//   city: string;
//   category?: string;
//   subCategory?: string;
//   address: string;
//   zipCode: string;
//   termsAgreed: boolean;
// }

// export async function POST(req: NextRequest) {
//   let connection;

//   try {
//     const data = await req.json() as WaitlistRequest;

//     // Check if terms are agreed
//     if (!data.termsAgreed) {
//       return NextResponse.json({ 
//         error: 'You must agree to the Terms of Service and Privacy Policy' 
//       }, { status: 400 });
//     }

//     // Allowed zip codes
//     const allowedZipCodes = [
//       '80301', '80302', '80303', '80304', '80305', '80306',
//       '80026', '80027', '80020', '80021', '80023', '80234',
//       '80466', '80503', '80501', '80504'
//     ];

//     // Determine if the zip code is allowed and set status
//     const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);
//     const status = isAllowedZipCode ? 'available' : 'not available';

//     connection = await pool.getConnection();

//     // Duplicate check only in `business_waitlist`
//     const duplicateCheckQuery = `
//       SELECT 'business_waitlist' as source FROM business_waitlist 
//       WHERE businessEmail = ? OR phoneNumber = ?
//     `;
//     const duplicateCheckValues = [data.businessEmail, data.phoneNumber];
    
//     const [existingUsers] = await connection.execute<RowDataPacket[]>(duplicateCheckQuery, duplicateCheckValues);

//     if (existingUsers.length > 0) {
//       return NextResponse.json({ 
//         error: 'A user with this email or phone number already exists in our system' 
//       }, { status: 409 });
//     }

//     // Insert data into `business_waitlist`
//     const query = `
//       INSERT INTO business_waitlist
//       (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
//        category, subCategory, address, zipCode, status) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const values = [
//       data.firstName,
//       data.lastName,
//       data.businessName || null,
//       data.phoneNumber,
//       data.businessEmail,
//       data.city,
//       data.category || null,
//       data.subCategory || null,
//       data.address,
//       data.zipCode,
//       status
//     ];

//     await connection.execute(query, values);

//     const message = isAllowedZipCode
//       ? 'Successfully joined the Tribe Me BETA Launch!'
//       : 'Your business is outside our current service area but has been added to the waitlist for future launches.';

//     return NextResponse.json({ message, status }, { status: 200 });

//   } catch (error) {
//     console.error('Waitlist API Error:', error);
//     return NextResponse.json({ 
//       error: 'An error occurred while processing your request' 
//     }, { status: 500 });

//   } finally {
//     if (connection) {
//       connection.release();
//     }
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface WaitlistRequest {
  firstName: string;
  lastName: string;
  businessName?: string;
  phoneNumber: string;
  businessEmail: string;
  city: string;
  category?: string; // Optional single category
  subCategory?: string[]; // Optional array of subcategories
  address: string;
  zipCode: string;
  termsAgreed: boolean;
}

export async function POST(req: NextRequest) {
  let connection;

  try {
    const data = await req.json() as WaitlistRequest;

    // Check if terms are agreed
    if (!data.termsAgreed) {
      return NextResponse.json({ 
        error: 'You must agree to the Terms of Service and Privacy Policy' 
      }, { status: 400 });
    }

    // Allowed zip codes
    const allowedZipCodes = [
      '80301', '80302', '80303', '80304', '80305', '80306',
      '80026', '80027', '80020', '80021', '80023', '80234',
      '80466', '80503', '80501', '80504'
    ];

    // Determine if the zip code is allowed and set status
    const isAllowedZipCode = allowedZipCodes.includes(data.zipCode);
    const status = isAllowedZipCode ? 'Available' : 'Not Available';

    connection = await pool.getConnection();

    // Duplicate check only in `business_waitlist`
    const duplicateCheckQuery = `
      SELECT 'business_waitlist' as source FROM business_waitlist 
      WHERE businessEmail = ? OR phoneNumber = ?
    `;
    const duplicateCheckValues = [data.businessEmail, data.phoneNumber];
    
    const [existingUsers] = await connection.execute<RowDataPacket[]>(duplicateCheckQuery, duplicateCheckValues);

    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        error: 'A user with this email or phone number already exists in our system' 
      }, { status: 409 });
    }

    // Convert subCategories array to comma-separated string
    const subCategoriesString = data.subCategory ? data.subCategory.join(',') : '';

    // Insert data into `business_waitlist`
    const insertWaitlistQuery = `
      INSERT INTO business_waitlist
      (firstName, lastName, businessName, phoneNumber, businessEmail, city, 
       category, subCategory, address, zipCode, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.firstName,
      data.lastName,
      data.businessName || null,
      data.phoneNumber,
      data.businessEmail,
      data.city,
      data.category || '', // Single category (default to empty string if undefined)
      subCategoriesString, // Comma-separated subcategories
      data.address,
      data.zipCode,
      status
    ];

    await connection.execute(insertWaitlistQuery, values);

    const message = isAllowedZipCode
      ? 'Successfully joined the Tribe Me BETA Launch!'
      : 'Your business is outside our current service area but has been added to the waitlist for future launches.';

    return NextResponse.json({ message, status }, { status: 200 });

  } catch (error) {
    console.error('Waitlist API Error:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing your request' 
    }, { status: 500 });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}
