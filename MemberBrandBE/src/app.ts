import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import './services/google.service';
import './services/apple.service';
import './services/facebook.service';
import './services/clean-up.service';
import { FcmService } from './services/fcm.service';
import { Service } from 'typedi';
import { useExpressServer } from 'routing-controllers';
import router from './routes/routers.routes';
import config from './config';
import { getConnection } from './db-connection';
import http, { Server } from 'http'; // Import Server type
import { BrandOfferController } from './controllers/brand/brand offers/offer.controllers';
import { NotificationController } from './controllers/member/notification/notification.controller';
import { SocketService } from './services/socket.service';

@Service()
export class App {
  public readonly expressApplication: express.Application;

  constructor() {
    this.expressApplication = express();
    FcmService.initialize();
    this.initializeMiddleware();
    this.initializeControllers();
  }

  private initializeMiddleware(): void {
    if (config.env === 'development') {
      this.expressApplication.use((req, res, next) => {
        console.log(`Request received: method: ${req.method}, url: ${req.url}`);
        res.on('finish', () => {
          console.log(`Request completed: statusCode: ${res.statusCode}`);
        });
        next();
      });
    }

    function getCorsOptions() {
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'testing') {
        return {
          origin: [
            'http://localhost:3000',
            'http://localhost:3000/login',
            'http://localhost:8081',
            '192.168.100.20:8081',
            'https://brands.tribeme.com',
            'https://brands.tribeme.com/login',
            'http://192.168.16.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'https://brands-admin-zbsj.vercel.app',
          ],
          optionsSuccessStatus: 200,
          credentials: true,
          methods: 'GET,POST,PUT,PATCH,DELETE',
          allowedHeaders: ['Content-Type', 'Authorization'],
        };
      } else {
        return {
          origin: '*',
          optionsSuccessStatus: 200,
          credentials: true,
        };
      }
    }
    this.expressApplication.use(cors(getCorsOptions()));
    this.expressApplication.use(bodyParser.json());
    this.expressApplication.use(bodyParser.urlencoded({ extended: true }));
    this.expressApplication.use(
      session({
        secret: process.env.SESSION_SECRET || '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',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'testing' },
      })
    );

    this.expressApplication.use(passport.initialize());
    this.expressApplication.use(passport.session());
    this.expressApplication.use(router);

    if (config.env === 'production' || config.env === 'testing') {
      this.expressApplication.get('/', (_, res) => {
        console.log('Member and Brands backend is live now');
        res.send('Member and brands backend is live now');
      });
    }
  }

  private initializeControllers(): void {
    useExpressServer(this.expressApplication, {
      controllers: [__dirname + '/controllers/*.ts'],
      defaultErrorHandler: false,
    });
  }

  private validateServerConfig(): { isValid: boolean; message: string } {
    const { env, server } = config;
    const port = server.port;

    if (env === 'production' && port !== 443) {
      return {
        isValid: false,
        message: 'Production environment must use port 443 for HTTPS',
      };
    }

    if (env === 'development' && ![3000, 4000].includes(port)) {
      return {
        isValid: false,
        message: 'Development environment must use either port 3000 or 4000',
      };
    }

    if (env === 'testing' && ![3000, 4000].includes(port)) {
      return {
        isValid: false,
        message: 'Testing environment must use either port 3000 or 4000',
      };
    }

    return { isValid: true, message: '' };
  }

  private getServerConfig(): {
    server: Server | null;
    error: string | null;
  } {
    try {
      const { env } = config;
      const port = config.server.port;

      if (env === 'development') {
        if ([3000, 4000].includes(port)) {
          return {
            server: http.createServer(this.expressApplication),
            error: null,
          };
        }
        return {
          server: null,
          error: 'Development environment requires port 3000 or 4000',
        };
      }

      if (env === 'testing') {
        if ([3000, 4000].includes(port)) {
          return {
            server: http.createServer(this.expressApplication),
            error: null,
          };
        }
        return {
          server: null,
          error: 'Testing environment requires port 3000 or 4000',
        };
      }

      return {
        server: null,
        error: `Invalid environment: ${env}`,
      };
    } catch (error) {
      return {
        server: null,
        error: `Server configuration error: ${(error as Error).message}`,
      };
    }
  }

  public async startExpressServer(): Promise<Server> {
    try {
      await getConnection();

      const validation = this.validateServerConfig();
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const { server, error } = this.getServerConfig();
      if (error || !server) {
        throw new Error(error || 'Failed to create server');
      }

      const serverPromise = new Promise<Server>((resolve, reject) => {
        server
          .listen(config.server.port, () => {
            const serverType = config.env === 'production' ? 'HTTPS' : 'HTTP';
            console.log(
              `\n${serverType} Server running on: {\n` +
                ` PORT: ${config.server.port}\n` +
                ` ENVIRONMENT: ${config.env}\n` +
                ` DATABASE: ${config.database[config.env].name}\n` +
                ` HOST: ${config.database[config.env].host}\n}`
            );
            resolve(server);
          })
          .on('error', (err) => {
            console.error('Server startup error:', err);
            reject(err);
          });
      });

      const runServer: Server = await serverPromise;

      const socketService = SocketService.getInstance(runServer);
      NotificationController.setSocketService(socketService);
      BrandOfferController.setSocketService(socketService);

      return runServer;
    } catch (error) {
      console.error('Server initialization failed:', error);
      throw error;
    }
  }
}
