import userDBHelper from "../database/userDBHelper";
import accessTokensDBHelper from "../database/accessTokensDBHelper";

function getClient(clientID, clientSecret, callback){

  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null
  };

  callback(false, client);
}

/* Determines whether or not the client which has to the specified clientID is permitted to use the specified grantType.
  The callback takes an eror of type truthy, and a boolean which indcates whether the client that has the specified clientID
  is permitted to use the specified grantType. As we're going to hardcode the response no error can occur
  hence we return false for the error and as there is there are no clientIDs to check we can just return true to indicate
  the client has permission to use the grantType. */
function grantTypeAllowed(clientID, grantType, callback) {

  console.log('grantTypeAllowed called and clientID is: ', clientID, ' and grantType is: ', grantType);

  callback(false, true);
}


/* The method attempts to find a user with the spcecified username and password. The callback takes 2 parameters.
   This first parameter is an error of type truthy, and the second is a user object. You can decide the structure of
   the user object as you will be the one accessing the data in the user object in the saveAccessToken() method. The library
   doesn't access the user object it just supplies it to the saveAccessToken() method */
function getUser(username, password, callback){

  console.log('getUser() called and username is: ', username, ' and password is: ', password, ' and callback is: ', callback, ' and is userDBHelper null is: ', userDBHelper);

  //try and get the user using the user's credentials
  userDBHelper.getUserFromCredentials(username, password, callback)
}

/* saves the accessToken along with the userID retrieved the specified user */
function saveAccessToken(accessToken, clientID, expires, user, callback){

  console.log('saveAccessToken() called and accessToken is: ', accessToken,
    ' and clientID is: ',clientID, ' and user is: ', user, ' and accessTokensDBhelper is: ', accessTokensDBHelper);

  //save the accessToken along with the user.id
  accessTokensDBHelper.saveAccessToken(accessToken, user.id, callback)
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
function getAccessToken(bearerToken, callback) {

  //try and get the userID from the db using the bearerToken
  accessTokensDBHelper.getUserIDFromBearerToken(bearerToken, (userID) => {

    //create the token using the retrieved userID
    const accessToken = {
      user: {
        id: userID,
      },
      expires: null
    };

    //set the error to true if userID is null, and pass in the token if there is a userID else pass null
    callback(userID == null, userID == null ? null : accessToken)
  })
}

module.exports =  {
  "getClient": getClient,
  "saveAccessToken": saveAccessToken,
  "getUser": getUser,
  "grantTypeAllowed": grantTypeAllowed,
  "getAccessToken": getAccessToken
};