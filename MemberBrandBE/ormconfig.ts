import { ConnectionOptions } from "typeorm";
import config from "./src/config";
import "./dotenv";

const getSslConfig = (environment: string) => {
  switch (environment) {
    case "production":
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    case "development":
      return {
        ssl: false,
      };
    case "testing":
      return {
        ssl: {
          rejectUnauthorized: false,
        },
      };
    default:
      throw new Error(`Unsupported environment: ${environment}`);
  }
};

const connectionOptions: ConnectionOptions = {
  type: "postgres",
  host: config.database[config.env].host,
  port: config.database[config.env].port,
  username: config.database[config.env].username,
  password: config.database[config.env].password,
  database: config.database[config.env].name,
  // Only synchronize in development, not in production or testing
  synchronize: config.env === "development",
  ...getSslConfig(config.env),
  // Reduce logging to only errors in production and testing
  logging: config.env === "development" ? ["error", "warn", "log"] : ["error"],
  entities: [__dirname + "/src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.ts"],
  // Add connection pool configuration
  extra: {

    // Connection timeout in milliseconds
    connectionTimeoutMillis: 0,
    // Idle timeout in milliseconds
    idleTimeoutMillis: 30000
  },
  // Cache queries to improve performance
  cache: {
    duration: 30000 // 30 seconds
  }
};

export default connectionOptions;
