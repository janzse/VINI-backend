import express from "express";
import authRoutesMethods from "../../authorisation/routeMethods";

const router = express.Router();

function initRoutes(app) {
  authRoutesMethods.setApp(app);

  /* POST Login. */
  router.post('/login', app.oauth.grant(), authRoutesMethods.login); // FIXME authRoutesMethods.login not beeing called

  router.post('/loginTEMP', authRoutesMethods.login); // TODO DELETE ME WHEN GRANT IS WORKING

  /* POST user register. */
  router.post('/register', authRoutesMethods.registerUser);

  /* DELETE user register. */
  router.delete('/register', authRoutesMethods.deleteUser);
  
  /* GET Users*/
  router.get('/', authRoutesMethods.getUsers);
}


// The expressApp is needed for the oAuthServer, therefore this asynchronous approach is needed
module.exports = {
  "router": router,
  "initRoutes": initRoutes
};
