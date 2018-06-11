import dbConnection from "./msSqlWrapper";

//TODO: Alle Parameter übergeben, um diese in die Datenbank einfügen zu können
function registerUserInDB(email, password, callback) {

  const queryString = `INSERT INTO users (email, password, privateKey, authorityLevel) VALUES ('${email}', '${password}', 'abc123testkey', 1);`;

  dbConnection.query(queryString, callback);
}

function getUserFromCredentials(email, password, callback) {

  const queryString = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

  dbConnection.query(queryString, (err, result) => {

    console.log("Err: ", err);
    console.log("Result: ", result);

    if (result.length === 0) {
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

  const queryString = `SELECT * FROM users WHERE email = '${email}'`;

  // holds the results  from the query
  const sqlCallback = (err, results) => {

    const doesUserExist = results !== null && results.length > 0 ? true : null;

    callback(doesUserExist);
  };

  dbConnection.query(queryString, sqlCallback)
}

function deleteUserFromDB(email, callback) {
  const query = `DELETE FROM users WHERE email = '${email}'`;
  const sqlCallback = (err, results) => {
    const isUserDeleted = results !== null ? results.length > 0 : null;
    callback(error, isUserDeleted);
  };

  dbConnection.query(query, sqlCallback);
}

function getCarAddressFromVin(vin, callback) {

  const queryString = `SELECT publicKey FROM kfz WHERE vin = '${vin}'`;

  const sqlCallback = (err, results) => {

    if (results.length === 0) {
      console.log("Could not find vin: ", vin);
    }
    else {
      callback(results[0]);
    }
  };

  dbConnection.query(queryString, sqlCallback);
}

function getUserInfoFromToken(token, callback) {

  const queryString = `SELECT privateKey,email FROM users WHERE id = (SELECT user_id FROM bearer_tokens WHERE token = '${token}')`;

  const sqlCallback = (err, results) => {
    if (results.length === 0) {
      console.log("Could not find user by bearerToken: ", token);
    }
    else {
      callback(results[0], results[1]);
    }
  };

  dbConnection.query(queryString, sqlCallback);
}


module.exports = {
  "registerUserInDB": registerUserInDB,
  "getUserFromCredentials": getUserFromCredentials,
  "doesUserExist": doesUserExist,
  "deleteUserFromDB": deleteUserFromDB,
  "getCarAddressFromVin": getCarAddressFromVin,
  "getUserInfoFromToken": getUserInfoFromToken
};
