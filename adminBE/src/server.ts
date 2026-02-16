// // import app from "./app";
// // import dotenv from "dotenv";
// // import { createServer, Server } from "http";

// // dotenv.config();

// // const PORT = process.env.PORT || 5000;
// // const MAX_RETRIES = 3;

// // // Declare server variable at the top level
// // let server: Server;

// // const startServer = async (retryCount = 0) => {
// //   server = createServer(app);

// //   try {
// //     await new Promise((resolve, reject) => {
// //       server.listen(PORT)
// //         .once('listening', () => {
// //           console.log(`✅ Server is running on port ${PORT}`);
// //           resolve(true);
// //         })
// //         .once('error', (err: NodeJS.ErrnoException) => {
// //           if (err.code === 'EADDRINUSE') {
// //             reject(new Error(`Port ${PORT} is already in use`));
// //           } else {
// //             reject(err);
// //           }
// //         });
// //     });
// //   } catch (error) {
// //     if (retryCount < MAX_RETRIES) {
// //       console.log(`⚠️ Retry attempt ${retryCount + 1} of ${MAX_RETRIES}...`);
// //       await new Promise(resolve => setTimeout(resolve, 2000));
// //       return startServer(retryCount + 1);
// //     }
    
// //     console.error('❌ Failed to start server after multiple attempts:', (error as Error).message);
// //     process.exit(1);
// //   }
// // };

// // const shutdown = () => {
// //   console.log('\n⚠️ Received shutdown signal. Closing server...');
// //   if (server) {
// //     server.close(() => {
// //       console.log('✅ Server closed successfully');
// //       process.exit(0);
// //     });

// //     // Force close if graceful shutdown takes too long
// //     setTimeout(() => {
// //       console.error('❌ Could not close connections in time, forcefully shutting down');
// //       process.exit(1);
// //     }, 10000);
// //   } else {
// //     process.exit(0);
// //   }
// // };

// // // Handle various shutdown signals
// // process.on('SIGTERM', shutdown);
// // process.on('SIGINT', shutdown);

// // // Handle uncaught exceptions
// // process.on('uncaughtException', (error) => {
// //   console.error('❌ Uncaught Exception:', error);
// //   shutdown();
// // });

// // // Handle unhandled promise rejections
// // process.on('unhandledRejection', (reason, promise) => {
// //   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
// // });

// // // Start the server
// // startServer().catch((error) => {
// //   console.error('❌ Failed to start server:', error.message);
// //   process.exit(1);
// // });

// import app from "./app";

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import app from "./app"; // Keep only the import here
// Remove the server startup code as it's already in app.ts
