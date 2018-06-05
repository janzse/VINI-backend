import express from "express";
import authRoutesMethods from "../../authorisation/authRoutesMethods";

const router = express.Router();

function initRoutes(app) {
  authRoutesMethods.setApp(app);

  /* POST Login. */
  router.post('/login', app.oauth.grant(), authRoutesMethods.login);

  /* POST user register. */
  router.post('/register', authRoutesMethods.registerUser);

  /* DELETE user register. */
  router.delete('/register', function (req, res, next) {
    //TODO: Muss noch umgesetzt werden
    res.send(req.body);    // echo the result back
  });
}

// The expressApp is needed for the oAuthServer, therefore this asynchronous approach is needed
module.exports = {
  "router": router,
  "initRoutes": initRoutes
};