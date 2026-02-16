// import Redis from "ioredis";
// import config from "../config";

// export class RedisService {
//   private static client: Redis;

//   // Initialize Redis client
//   public static initialize() {
//     if (!this.client) {
//       this.client = new Redis({
//         host:
//           config.redis.host ||
//           "redis-11294.c80.us-east-1-2.ec2.redns.redis-cloud.com",
//         port: config.redis.port || 11294,
//         password: config.redis.password || "rSjiH5R79VXq40i8rYkQk6RRDGWhDx2e",
//         // Add connection options for better performance
//         connectTimeout: 10000, // 10 seconds
//         maxRetriesPerRequest: 3,
//         retryStrategy(times) {
//           const delay = Math.min(times * 50, 2000); // Exponential backoff with max 2 seconds
//           return delay;
//         },
//         // Add connection pool options
//         enableReadyCheck: true,
//         enableOfflineQueue: true,
//         // Add keep-alive to prevent connection drops
//         keepAlive: 10000, // 10 seconds
//       });

//       this.client.on("connect", () => {
//         if (config.env === "development") {
//           console.log("\nConnected to Redis....!");
//         }
//       });
//       this.client.on("error", (err) => console.error("Redis error:", err));
//       this.client.on("reconnecting", () => {
//         if (config.env === "development") {
//           console.log("Reconnecting to Redis...");
//         }
//       });
//     }
//   }

//   // Local memory cache for frequently accessed keys
//   private static memoryCache: Map<string, { value: string, expiry: number }> = new Map();

//   // Get value from Redis with local caching for better performance
//   public static async get(key: string): Promise<string | null> {
//     try {
//       // Check memory cache first
//       const cachedItem = this.memoryCache.get(key);
//       if (cachedItem && cachedItem.expiry > Date.now()) {
//         return cachedItem.value;
//       }

//       // If not in memory cache or expired, get from Redis
//       const value = await this.client.get(key);
      
//       // Store in memory cache with 5-second expiry
//       if (value) {
//         this.memoryCache.set(key, {
//           value,
//           expiry: Date.now() + 5000 // 5 seconds cache
//         });
//       }
      
//       return value;
//     } catch (err) {
//       console.error(`Error getting key "${key}" from Redis:`, err);
//       // Return from memory cache even if expired as fallback
//       const cachedItem = this.memoryCache.get(key);
//       if (cachedItem) {
//         return cachedItem.value;
//       }
//       return null; // Return null instead of throwing to prevent cascading failures
//     }
//   }

//   // Set value in Redis
//   public static async set(
//     key: string,
//     value: string,
//     ttl?: number
//   ): Promise<void> {
//     try {
//       if (ttl) {
//         await this.client.set(key, value, "EX", ttl); // Set with expiry
//       } else {
//         await this.client.set(key, value);
//       }
//     } catch (err) {
//       console.error(`Error setting key "${key}" in Redis:`, err);
//       throw err;
//     }
//   }

//   // Delete key from Redis
//   public static async del(key: string): Promise<void> {
//     try {
//       await this.client.del(key);
//     } catch (err) {
//       console.error(`Error deleting key "${key}" from Redis:`, err);
//       throw err;
//     }
//   }
// }
