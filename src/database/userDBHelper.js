const dbCon = require('./msSqlWrapper');

function registerUserInDB(username, password, callback) {

  const registerUserQuery = `INSERT INTO users (username, password) VALUES ('${username}', SHA('${password}'));`;

  dbCon.query(registerUserQuery, callback);
}

function getUserFromCredentials(username, password, callback) {

  //const getUserQuery = `SELECT * FROM users WHERE username = '${username}' AND password = SHA('${password}');`;
  const getUserQuery = `SELECT * FROM users`;

  dbCon.query(getUserQuery, callback);
}

module.exports =  {
  "registerUserInDB": registerUserInDB,
  "getUserFromCredentials": getUserFromCredentials
};
