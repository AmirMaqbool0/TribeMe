import express from "express";
import { AuthBrandController } from "../../controllers/brand/auth/auth.controller";
import { validateRequest } from "../../middleware/validation.middleware";

const Router = express.Router();
Router.use(validateRequest);

Router.post("/create-password", AuthBrandController.setNewPassword);
Router.post("/brand/login", AuthBrandController.login);

export { Router as authBrandRouter };
