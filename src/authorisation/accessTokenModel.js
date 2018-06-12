import userDBHelper from "../database/dbHelper";
import accessTokensDBHelper from "../database/accessTokensDBHelper";

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

    console.log('grantTypeAllowed called and clientID is: ', clientID, ' and grantType is: ', grantType);

    callback(false, true);
}

/**
 * This function attempts to find a user with the given email and password.
 * @param email the email of the user to search
 * @param password the password of the user to search
 * @param callback a function taking an error-indicator and a user object as parameter
 */
function getUser(email, password, callback) {

    console.log('getUser() called and email is: ', email, ' and password is: ', password, ' and callback is: ', callback);

    //try and get the user using the user's credentials
    userDBHelper.getUserFromCredentials(email, password, callback)
}

/**
 * This function attempts to save the generated accessToken in the database. The table for this is bearer_token.
 * @param accessToken the token to be saved
 * @param clientID the ID of the client attempting to get the accessToken
 * @param expires the amount of second which the accessToken is valid
 * @param user the user object
 * @param callback a function taking an error-indicator and the query results as parameter
 */
function saveAccessToken(accessToken, clientID, expires, user, callback) {

    console.log('saveAccessToken() called and accessToken is: ', accessToken,
        ' and clientID is: ', clientID, ' and user is: ', user, ' and accessTokensDBhelper is: ', accessTokensDBHelper);

    //save the accessToken along with the user.id
    accessTokensDBHelper.saveAccessToken(accessToken, user.id, expires, callback)
}

/* This method is called when a user is using a bearerToken they've already got as authentication
   i.e. when they're calling APIs. The method effectively serves to validate the bearerToken. A bearerToken
   has been successfully validated if passing it to the getUserIDFromBearerToken() method returns a userID.
   It's able to return a userID because each row in the access_tokens table has a userID in it so we can use
   the bearerToken to query for a row which will have a userID in it.
   The callback takes 2 parameters:
   1. A truthy boolean indicating whether or not an error has occured. It should be set to a truthy if
   there is an error or a falsy if there is no error
   2. An accessToken which contains an expiration date, you can assign null to ensure the token doesnin't expire.
  Then either a user object, or a userId which is a string or a number.
  If you create a user object you can access it in authenticated endpoints in the req.user object.
  If you create a userId you can access it in authenticated endpoints in the req.user.id object.
 */
function getAccessToken(accessToken, callback) {

    //try and get the userID from the db using the bearerToken
    accessTokensDBHelper.getUserIDFromAccessToken(accessToken, (userID) => {

        const token = {
            user: {
                id: userID,
            },
            expires: null
        };

        //set the error to true if userID is null, and pass in the token if there is a userID else pass null
        callback(userID == null, userID == null ? null : token)
    })
}

module.exports = {
    "getClient": getClient,
    "saveAccessToken": saveAccessToken,
    "getUser": getUser,
    "grantTypeAllowed": grantTypeAllowed,
    "getAccessToken": getAccessToken
};