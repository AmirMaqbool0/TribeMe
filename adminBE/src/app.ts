// // import express from "express";
// // import { AppDataSource } from "./config/db";
// // import adminRoutes from "./routes/adminRoutes";
// // import brandRoutes from "./routes/brandRoutes";

// // const app = express();

// // app.use(express.json());

// // app.use("/api/admin", adminRoutes);
// // app.use("/api/brand", brandRoutes);

// // export default app;
// import express from "express";
// import { AppDataSource } from "./config/db";
// import adminRoutes from "./routes/adminRoutes";
// import brandRoutes from "./routes/brandRoutes";

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());

// // Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/brand", brandRoutes);

// // Error handling middleware
// app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error("An error occurred:", error);
//   const message = error instanceof Error ? error.message : "Unknown error";
//   res.status(500).json({ message });
// });

// // Initialize database and start the server
// AppDataSource.initialize()
//   .then(() => {
//     console.log("Data Source has been initialized!");
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Error during Data Source initialization:", error instanceof Error ? error.message : error);
//   });

// export default app;
import express from "express";
import session from "express-session"; // Import the express-session middleware
import { AppDataSource } from "./config/db";
import adminRoutes from "./routes/adminRoutes";
import brandRoutes from "./routes/brandRoutes";
import forgetPasswordRoutes from "./routes/forgetPasswordRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://admin.tribeme.com/login",
  "https://admin.tribeme.com",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: false }
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Tribe-Me admin backend");
});
app.use("/api/admin", adminRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/password-reset", forgetPasswordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("An error occurred:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message });
  }
);

// Initialize database and start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running : http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "Error during Data Source initialization:",
      error instanceof Error ? error.message : error
    );
  });

export default app;
