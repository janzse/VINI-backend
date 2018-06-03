import dbConnection from "./msSqlWrapper";

//TODO: Alle Parameter übergeben, um diese in die Datenbank einfügen zu können
function registerUserInDB(email, password, callback) {

  const registerUserQuery = `INSERT INTO users (email, password, privateKey, authorityLevel) VALUES ('${email}', '${password}', 'abc123testkey', 1);`;

  dbConnection.query(registerUserQuery, callback);
}

function getUserFromCredentials(email, password, callback) {

  const getUserQuery = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

  dbConnection.query(getUserQuery, (err, result) => {

    console.log("Result: ", result);

    //TODO: Prüfen, was alles für das Client-Objekt im weiteren Verlauf benötigt wird
    let usersResult = {
      "id": result[0],
      "email": result[1],
      "password": result[2]
    };

    callback(null, usersResult);
  });
}

function doesUserExist(email, callback) {

  const doesUserExistQuery = `SELECT * FROM users WHERE email = '${email}'`;

  //holds the results  from the query
  const sqlCallback = (results) => {

    //calculate if user exists or assign null if results is null
    const doesUserExist = results !== null ? results.length > 0 : null;

    //check if there are any users with this username and return the appropriate value
    callback(doesUserExist);
  };

  //execute the query to check if the user exists
  dbConnection.query(doesUserExistQuery, sqlCallback)
}

module.exports =  {
  "registerUserInDB": registerUserInDB,
  "getUserFromCredentials": getUserFromCredentials,
  "doesUserExist": doesUserExist
};
