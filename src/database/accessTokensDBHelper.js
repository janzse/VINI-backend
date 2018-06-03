import dbConnection from "./msSqlWrapper";

function saveAccessToken(token, userID, callback) {

  //TODO: bearer_token Tabelle anlegen (token, user_id)
  //TODO: Auf msSQL Syntax ändern ("ON DUPLICATE" passt nicht)
  const insertTokenQuery = `INSERT INTO bearer_tokens (token, user_id) VALUES ('${token}', ${userID}) ON DUPLICATE KEY UPDATE token = '${token}';`;

  dbConnection.query(insertTokenQuery, callback);
}

function getUserIDFromAccessToken(token, callback) {

  const getUserIDQuery = `SELECT * FROM bearer_tokens WHERE token = '${token}';`;

  dbConnection.query(getUserIDQuery, (resultValues) => {

    const userID = resultValues != null && resultValues.length === 1 ? resultValues[0].user_id : null;

    callback(userID);
  });
}


module.exports = {
  "saveAccessToken": saveAccessToken,
  "getUserIDFromAccessToken": getUserIDFromAccessToken
};