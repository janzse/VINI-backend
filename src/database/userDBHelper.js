import dbConnection from "./msSqlWrapper";

//TODO: Alle Parameter übergeben, um diese in die Datenbank einfügen zu können
function registerUserInDB(email, password, callback) {

  const registerUserQuery = `INSERT INTO users (email, password, privateKey, authorityLevel) VALUES ('${email}', '${password}', 'abc123testkey', 1);`;

  dbConnection.query(registerUserQuery, callback);
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
      "password": result[2]
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

module.exports =  {
  "registerUserInDB": registerUserInDB,
  "getUserFromCredentials": getUserFromCredentials,
  "doesUserExist": doesUserExist
};
