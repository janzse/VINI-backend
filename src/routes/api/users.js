import express from "express";
import authRoutesMethods from "../../authorisation/routeMethods";

const router = express.Router();

function initRoutes(app) {

    /* POST Login. */
    router.post('/token', app.oauth.grant());

    router.get('/login', authRoutesMethods.isAuthorised, authRoutesMethods.login);

    /* POST user register. */
    router.post('/register', authRoutesMethods.registerUser);

    /* DELETE user register. */
    router.delete('/register', authRoutesMethods.blockUser);

    /* GET Users*/
    router.get('/', authRoutesMethods.getUsers);
}


// The expressApp is needed for the oAuthServer, therefore this asynchronous approach is needed
module.exports = {
    "router": router,
    "initRoutes": initRoutes
};
// TODO: Verifikation über AccessToken