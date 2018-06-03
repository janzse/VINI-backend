import express from "express";
import authRoutesMethods from "./authRoutesMethods";

const router = express.Router();

function registerRoutes(app){

  router.post('/registerUser', authRoutesMethods.registerUser);
  router.post('/login', app.oauth.grant(), authRoutesMethods.login);
}

module.exports = (expressApp) => {
  registerRoutes(expressApp);

  return router;
};
