import 'reflect-metadata';
import Container from "typedi";
import { App } from './app';
import '../dotenv'
import { BrandOfferController } from './controllers/brand/brand offers/offer.controllers';

const application = Container.get(App)
void application.startExpressServer()
