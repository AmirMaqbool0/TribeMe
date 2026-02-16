import { Request, Response, NextFunction } from "express";
import { Admin } from "../entities/Admin";
import { AppDataSource } from "../config/db";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Session } from 'express-session';
import twilio from "twilio";

declare module 'express-session' {
  interface SessionData {
    token: string;
  }
}

declare module 'express' {
  interface Request {
    session: Session & { token?: string };
    admin?: Admin;
  }
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const adminRepository = AppDataSource.getRepository(Admin);

// Retrieve all Admins
export const getAdmins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const admins = await adminRepository.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Retrieve an Admin by ID
export const getAdminById = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await adminRepository.findOneBy({ admin_id: +req.params.id });
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update an Admin by ID
// export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const admin = await adminRepository.findOneBy({ admin_id: +req.params.id });
//     if (!admin) {
//       res.status(404).json({ error: "Admin not found" });
//       return;
//     }

//     adminRepository.merge(admin, req.body);
//     const result = await adminRepository.save(admin);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };
// Update an Admin by ID
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = +req.params.id;
    const admin = await adminRepository.findOneBy({ admin_id: adminId });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const { username, email, password } = req.body;

    // Check for username and email uniqueness
    if (username) {
      const existingUsername = await adminRepository.findOneBy({ username });
      if (existingUsername && existingUsername.admin_id !== adminId) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }
    }

    if (email) {
      const existingEmail = await adminRepository.findOneBy({ email });
      if (existingEmail && existingEmail.admin_id !== adminId) {
        res.status(400).json({ error: "Email already exists" });
        return;
      }
    }

    // Hash password if it is being updated
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword; // Update the password with the hashed version
    }

    // Merge other updates (excluding password) and save
    adminRepository.merge(admin, { ...req.body, password: admin.password });
    const result = await adminRepository.save(admin);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
// Delete an Admin by ID
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminRepository.delete(req.params.id);
    if (result.affected === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// // Register a new Admin
// export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { username, password } = req.body;
//     const existingAdmin = await adminRepository.findOneBy({ username });
//     if (existingAdmin) {
//       res.status(400).json({ error: "Username already exists" });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const admin = adminRepository.create({ username, password: hashedPassword });
//     const result = await adminRepository.save(admin);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };
// Register a new Admin
// export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { username, password, email } = req.body; // include email in the request body
//     const existingAdmin = await adminRepository.findOneBy({ username });
//     if (existingAdmin) {
//       res.status(400).json({ error: "Username already exists" });
//       return;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const admin = adminRepository.create({ username, password: hashedPassword, email }); // pass email to create
//     const result = await adminRepository.save(admin);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };

// Register a new Admin
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email, phone_number } = req.body; // include phone_number in the request body

    // Check if required fields are provided
    if (!email || !phone_number) {
      res.status(400).json({ error: "Email and phone number are required" });
      return;
    }

    const existingAdmin = await adminRepository.findOneBy({ username });
    if (existingAdmin) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = adminRepository.create({ username, password: hashedPassword, email, phone_number }); // pass email and phone_number to create
    const result = await adminRepository.save(admin);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Optionally save the OTP to a database or memory for verification later

    // Send OTP via Twilio
    // await twilioClient.messages.create({
    //   body: `Your verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER!,
    //   to: phone_number,
    // });

    res.status(201).json({ message: "Admin registered successfully, verification code sent." });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// // Login an Admin
// export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { username, password } = req.body;
//     const admin = await adminRepository.findOneBy({ username });
//     if (!admin) {
//       res.status(401).json({ error: "Invalid username or password" });
//       return;
//     }

//     const isPasswordValid = await bcrypt.compare(password, admin.password);
//     if (!isPasswordValid) {
//       res.status(401).json({ error: "Invalid username or password" });
//       return;
//     }

//     const token = jwt.sign({ adminId: admin.admin_id }, process.env.JWT_SECRET!, {
//       expiresIn: "1h",
//     });

//     // Store the token in the session
//     req.session.token = token;
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: (error as Error).message });
//   }
// };
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if(!username || !password){
      res.status(422).json({error: "username and password are required"})
      return;
    }
    const admin = await adminRepository.findOneBy({ username });
    if (!admin) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ adminId: admin.admin_id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Store the token in the session
    req.session.token = token; // Now this should work
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// Logout an Admin
export const logoutAdmin = (req: Request, res: Response): void => {
  req.session.destroy((err: Error) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Logged out successfully" });
  });
};

// Middleware to verify the token
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.session.token;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await adminRepository.findOneBy({
      admin_id: (decoded as any).adminId,
    });
    if (!admin) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
