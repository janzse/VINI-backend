import dbConnection from "./msSqlWrapper";

function registerUserInDB(email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked, callback) {

  const registerUserQuery = `INSERT INTO users (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked) 
  VALUES ('${email}', '${password}', '${privateKey}', '${authorityLevel}', '${forename}', '${surname}', '${companyName}', '${creationDate}', '${blocked}');`;

    const sqlCallback = (error, result) => {

        const isUserRegistered = (result) !== null ? result.length > 0 : null;
        callback(error, isUserRegistered);
    };

  dbConnection.query(registerUserQuery, sqlCallback);
}

function getUserFromCredentials(email, password, callback) {

  const getUserQuery = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

  dbConnection.query(getUserQuery, (err, result) => {

    console.log("Err: ", err);
    console.log("Result: ", result);

    if(result.length === 0){
      console.log("Invalid credentials");
      callback(true, null);
      return;
    }

    //TODO: Prüfen, was alles für das Client-Objekt im weiteren Verlauf benötigt wird
    let usersResult = {
      "id": result[0],
      "email": result[1],
      "password": result[2],
      "authorityLevel": result[4],
      "forename": result[5],
      "surename": result[6],
      "companyName": result[7],
      "blocked": result[9]
    };

    callback(false, usersResult);
  });
}

function doesUserExist(email, callback) {

  const doesUserExistQuery = `SELECT * FROM users WHERE email = '${email}'`;

  // holds the results  from the query
  const sqlCallback = (results) => {

    const doesUserExist = results !== null ? results.length > 0 : null;

    callback(doesUserExist);
  };

  dbConnection.query(doesUserExistQuery, sqlCallback)
}

function deleteUserFromDB(email, callback)
{
    const deleteUserQuery = `DELETE FROM users WHERE email = '${email}'`;
    const sqlCallback = (error, results) => {
      const isUserDeleted = results !== null ? results.length > 0 : null;
      callback(error, isUserDeleted);
    };

    dbConnection.query(deleteUserQuery, sqlCallback);
}

function isUserBlocked(userID, callback)
{
  const usersBlockedQuery = `SELECT blocked from users WHERE id = '${userID}'`;
  dbConnection.query(usersBlockedQuery, (error, result) => {
      if(result.length === 0){
          console.log("Invalid credentials");
          callback(true, null);
          return;
      }
      const userBlocked = result[9];
      callback(false, userBlocked);
  })
}

module.exports =  {
  "registerUserInDB": registerUserInDB,
  "getUserFromCredentials": getUserFromCredentials,
  "doesUserExist": doesUserExist,
  "deleteUserFromDB": deleteUserFromDB,
  "isUserBlocked": isUserBlocked
};
