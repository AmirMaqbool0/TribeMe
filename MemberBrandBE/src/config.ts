import convict from "convict";
import "../dotenv";
type Env = "development" | "production" | "testing";

const config = convict({
  env: {
    format: ["development", "production", "testing"],
    default: (process.env.NODE_ENV as Env) || "development",
    env: "NODE_ENV",
  },
  server: {
    port: {
      format: "port",
      default:
        process.env.NODE_ENV === "production"
          ? 443
          : process.env.PORT === "4000"
          ? 4000
          : 3000,
      env: "PORT",
    },
  },
  database: {
    development: {
      host: {
        format: "*",
        default: "localhost",
        env: "LOCAL_DB_HOST",
      },
      port: {
        format: "port",
        default: 5434,
        env: "LOCAL_DB_PORT",
      },
      name: {
        format: "*",
        default: "backend-tribeme",
        env: "LOCAL_DB_NAME",
      },
      username: {
        format: "*",
        default: "postgres",
        env: "LOCAL_DB_USER",
      },
      password: {
        format: "*",
        default: "ahsan221",
        env: "LOCAL_DB_PASSWORD",
      },
    },
    testing: {
      host: {
        format: "*",
        default: process.env.DB_HOST,
        env: "DB_HOST",
      },
      port: {
        format: "port",
        default: (process.env.DB_PORT, 10),
        env: "DB_PORT",
      },
      name: {
        format: "*",
        default: process.env.DB_NAME,
        env: "DB_NAME",
      },
      username: {
        format: "*",
        default: process.env.DB_USER,
        env: "DB_USER",
      },
      password: {
        format: "*",
        default: process.env.DB_PASSWORD,
        env: "DB_PASSWORD",
      },
      logging: {
        format: Array,
        default: ["warn", "error"],
      },
    },
    production: {
      host: {
        format: "*",
        default: process.env.DB_HOST,
        env: "DB_HOST",
      },
      port: {
        format: "port",
        default: (process.env.DB_PORT, 10),
        env: "DB_PORT",
      },
      name: {
        format: "*",
        default: process.env.DB_NAME,
        env: "DB_NAME",
      },
      username: {
        format: "*",
        default: process.env.DB_USERNAME,
        env: "DB_USER",
      },
      password: {
        format: "*",
        default: process.env.DB_PASSWORD,
        env: "DB_PASSWORD",
      },
      logging: {
        format: Array,
        default: ["warn", "error"],
      },
    },
  },

  jwt: {
    JWT_SECRET: {
      format: "*",
      default: process.env.JWT_SECRET,
      env: "JWT_SECRET",
    },
  },
  twilio: {
    sid: {
      format: "*",
      default: process.env.TWILLO_ACCOUNT_SID,
      env: "TWILLO_ACCOUNT_SID",
    },
    token: {
      format: "*",
      default: process.env.TWILLO_AUTH_TOKEN,
      env: "TWILLO_AUTH_TOKEN",
    },
    service_sid: {
      format: "*",
      default: process.env.SERVICE_SID,
      env: "SERVICE_SID",
    },
    phone: {
      format: "*",
      default: process.env.TWILLO_PHONE,
      env: "TWILLO_PHONE",
    },
    email: {
      format: "*",
      default: process.env.SENDGRID_API_KEY,
      env: "SENDGRID_API_KEY",
    },
  },
  s3_bucket: {
    access_key_id: {
      format: "*",
      default: process.env.ACCESS_KEY_ID,
      env: "ACCESS_KEY_ID",
    },
    secret_access_key: {
      format: "*",
      default: process.env.SECRET_ACCESS_KEY,
      env: "SECRET_ACCESS_KEY",
    },
    region: {
      format: "*",
      default: process.env.REGION,
      env: "REGION",
    },
  },
  stripe: {
    apikey: {
      format: "*",
   
    },
  },
  google: {
    clientID: {
      format: "*",
      default: process.env.CLIENT_ID,
      env: "CLIENT_ID",
    },
    clientSecret: {
      format: "*",
      default: process.env.CLIENT_SECRET,
      env: "CLIENT_SECRET",
    },
  },
  facebook: {
    clientID: {
      format: "*",
      default: process.env.APP_ID,
      env: "APP_ID",
    },
    clientSecret: {
      format: "*",
      default: process.env.APP_SECRET,
      env: "APP_SECRET",
    },
  },
  apple: {
    _client_ID: {
      format: "*",
      default: "com.tribeme.memberapp",
      env: "_CLIENT_ID",
    },
    teamID: {
      format: "*",
      default: "Y3B3R24Y37",
      env: "TEAM_ID",
    },
    keyID: {
      format: "*",
      default: "3SXFBK28W4",
      env: "KEY_ID",
    },
    privateKeyLocation: {
      format: "*",
      default: "./keys/auth-key.p8",
      env: "PRIVATE_KEY_LOCATION",
    },
  },
  // redis: {
  //   host: {
  //     format: "*",
  //     default: "redis-11294.c80.us-east-1-2.ec2.redns.redis-cloud.com",
  //     env: "REDIS_HOST",
  //   },
  //   port: {
  //     format: "*",
  //     default: 11294,
  //     env: "REDIS_PORT",
  //   },
  //   password: {
  //     format: "*",
  //     default: "rSjiH5R79VXq40i8rYkQk6RRDGWhDx2e",
  //     env: "REDIS_PASSWORD",
  //   },
  // },
  plaid: {
    sandbox: {
      format: "*",
      default: "",
      env: "PLAID_ENV",
    },
    client_id: {
      format: "*",
      default: "",
      env: "PLAID_CLIENT_ID",
    },
    secret: {
      format: "*",
      default: "",
      env: "PLAID_SECRET",
    },
  },
  cloudinary: {
    cloud_name: {
      format: "*",
      default: "californiapizzaclone",
      env: "CLOUDINARY_NAME",
    },
    api_key: {
      format: "*",
      default: "354574769319117",
      env: "CLOUDINARY_APIKEY",
    },
    api_secret: {
      format: "*",
      default: "UvPhqQ4X2rWNa4SLAFih27JcD-g",
      env: "CLOUDINARY_SECRET",
    },
  },
  firebase: {
    type: {
      format: "*",
      default: process.env.FIREBASE_TYPE,
      env: "FIREBASE_TYPE",
    },
    project_id: {
      format: "*",
      default: process.env.FIREBASE_PROJECT_ID,
      env: "FIREBASE_PROJECT_ID",
    },
    private_key_id: {
      format: "*",
      default: process.env.FIREBASE_PRIVATE_KEY_ID,
      env: "FIREBASE_PRIVATE_KEY_ID",
    },
    private_key: {
      format: "*",
      default: process.env.FIREBASE_PRIVATE_KEY,
      env: "FIREBASE_PRIVATE_KEY",
    },
    client_email: {
      format: "*",
      default: process.env.FIREBASE_CLIENT_EMAIL,
      env: "FIREBASE_CLIENT_EMAIL",
    },
    client_id: {
      format: "*",
      default: process.env.FIREBASE_CLIENT_ID,
      env: "FIREBASE_CLIENT_ID",
    },
    auth_uri: {
      format: "*",
      default: process.env.FIREBASE_AUTH_URI,
      env: "FIREBASE_AUTH_URI",
    },
    token_uri: {
      format: "*",
      default: process.env.FIREBASE_TOKEN_URI,
      env: "FIREBASE_TOKEN_URI",
    },
    auth_provider_x509_cert_url: {
      format: "*",
      default: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      env: "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
    },    client_x509_cert_url: {
      format: "*",
      default: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      env: "FIREBASE_CLIENT_X509_CERT_URL",
    },
    universe_domain: {
      format: "*",
      default: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
      env: "FIREBASE_UNIVERSE_DOMAIN",
    },
  },
});

config.validate({ allowed: "strict" });

export default config.getProperties();
