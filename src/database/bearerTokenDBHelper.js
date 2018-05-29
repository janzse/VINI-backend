import dbCon from "./msSqlWrapper";

function saveBearerToken(token, userID, callback){

  const insertTokenQuery = `INSERT INTO bearer_tokens (token, user_id) VALUES ('${token}', ${userID}) ON DUPLICATE KEY UPDATE token = '${token}';`;

  dbCon.query(insertTokenQuery, callback);
}

function getUserIDFromBearerToken(token, callback){

  const getUserIDQuery = `SELECT * FROM bearer_tokens WHERE token = '${token}';`;

  dbCon.query(getUserIDQuery, (resultValues) => {

    const userID = resultValues != null && resultValues.length === 1 ? resultValues[0].user_id : null;

    callback(userID);
  });
}


module.exports = {
  "saveBearerToken": saveBearerToken,
  "getUserIDFromBearerToken": getUserIDFromBearerToken
};