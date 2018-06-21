import dbHelper from "../database/dbHelper";
import tokenDBHelper from "../database/tokenDBHelper";

/* All methods in this file are called by the node-oauth2-server module. They are provided as an object in the "app.js"
* while instantiating the oAuthServer object.*/

/** This function returns the client application which attempts to get an accessToken. Since we're using the
 * grant_type "password" we don't need the first two parameters.
 * @param clientID the ID of the client attempting to get the accessToken
 * @param clientSecret the secret of the client attempting to get the accessToken
 * @param callback a function taking an error-indicator and a client object */
function getClient(clientID, clientSecret, callback) {

    // All of the properties can be null
    const client = {
        clientID,
        clientSecret,
        grants: null,
        redirectUris: null
    };

    callback(false, client);
}

/**
 * This function determines if a client with a given clientID is allowed to use the specified grantType.
 * @param clientID the ID of the client attempting to get the accessToken
 * @param grantType the given grantType ("password" in our use-case)
 * @param callback a function taking an error-indicator and a boolean, if the client is allowed to use the grantType
 * or not, as parameter
 */
function grantTypeAllowed(clientID, grantType, callback) {

    callback(false, true);
}

/**
 * This function attempts to find a user with the given email and password.
 * @param email the email of the user to search
 * @param password the password of the user to search
 * @param callback a function taking an error-indicator and a user object as parameter
 */
async function getUser(email, password, callback) {

    //try and get the user using the user's credentials
    const user = await dbHelper.getUserFromCredentials(email, password);
    callback(false, user);
}

/**
 * This function attempts to save the generated accessToken in the database. The table for this is bearer_token.
 * @param accessToken the token to be saved
 * @param clientID the ID of the client attempting to get the accessToken
 * @param expires the amount of second which the accessToken is valid
 * @param user the user object
 * @param callback a function taking an error-indicator and the query results as parameter
 */
async function saveAccessToken(accessToken, clientID, expires, user, callback) {

    //save the accessToken along with the user.id
    const result = await tokenDBHelper.saveAccessToken(accessToken, user.id, expires);
    if(result == null){
        console.log("Could not save access token to db");
        callback(true);
    }
    callback(false);
}


module.exports = {
    "getClient": getClient,
    "saveAccessToken": saveAccessToken,
    "getUser": getUser,
    "grantTypeAllowed": grantTypeAllowed
};