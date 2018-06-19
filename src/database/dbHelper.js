import dbConnection from "./msSqlWrapper";

function registerUserInDB(email, password, privateKey, publicKey, authorityLevel, forename, surname, companyName, creationDate, blocked, callback) {

    const queryString = `INSERT INTO users (email, password, privateKey, publicKey, authorityLevel, forename, surname, companyName,
  creationDate, blocked) VALUES ('${email}', '${password}', '${privateKey}', '${publicKey}', '${authorityLevel}', '${forename}', '${surname}', '${companyName}', '${creationDate}', '${blocked}');`;

    const sqlCallback = (err, result) => {

        const isUserRegistered = (result) !== null ? result.length > 0 : null;
        callback(err, isUserRegistered);
    };

    dbConnection.query(queryString, sqlCallback);
}

function registerCarInDB(vin, privateKey, publicKey, creationDate) {

    return new Promise((resolve) => {

        const queryString = `INSERT INTO kfz (vin, privateKey, publicKey, creationDate) VALUES ('${vin}', '${privateKey}', '${publicKey}', '${creationDate}')`;

        const sqlCallback = (err, result) => {
            console.log("FINISHED QUERY: ", err, "res ", result);
            resolve(err === true ? null : result);
        };

        dbConnection.query(queryString, sqlCallback);
    });
}

function getUserFromCredentials(email, password, callback) {

    const queryString = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

    dbConnection.query(queryString, (err, result) => {

        if (result == null || result.length === 0) {
            console.log("Invalid credentials");
            callback(true, null); //FIXME stürzt ab POST /api/users/login 500 279.160 ms - 2531 OAuth2Error: false
            return;
        }

        //TODO: Prüfen, was alles für das Client-Objekt im weiteren Verlauf
        // benötigt wird
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

function blockUserInDB(email, callback) {
    const query = `
    BEGIN TRANSACTION
    IF EXISTS (SELECT * FROM bearer_tokens WITH (updlock,serializable) 
    WHERE user_id LIKE (SELECT id FROM users WHERE email LIKE '${email}'))
    BEGIN
    DELETE FROM bearer_tokens WHERE user_id LIKE (SELECT id FROM users WHERE email LIKE '${email}')
    END
    UPDATE users SET blocked = 1 WHERE email = '${email}'
    COMMIT TRANSACTION
    `;
    const sqlCallback = (err, results) => {
        const isUserDeleted = results != null;
        console.log("deleteUserFromDB - sqlCallback");
        callback(err, isUserDeleted);
    };

    dbConnection.query(query, sqlCallback);
}

function getCarAddressFromVin(vin, callback) {

    const queryString = `SELECT publicKey FROM kfz WHERE vin = '${vin}'`;

    const sqlCallback = (err, results) => {

        if (results === null || results.length === 0) {
            console.log("Could not find vin: ", vin);
            callback(err, null);
        }
        else {
            callback(err, results[0]);
        }
    };

    dbConnection.query(queryString, sqlCallback);
}

function getUserInfoFromToken(token, callback) {

    const queryString = `SELECT privateKey, publicKey, email FROM users WHERE id = (SELECT user_id FROM bearer_tokens WHERE token = '${token}')`;

    const sqlCallback = (err, results) => {
        if (results.length === 0) {
            console.log("Could not find user by bearerToken: ", token);
        }
        else {
            callback(results[0], results[1], results[2]);
        }
    };

    dbConnection.query(queryString, sqlCallback);
}

function checkUserAuthorization(token, callback) {
    const queryString = `SELECT users.blocked, users.id, users.authorityLevel, tokens.expiration FROM users, bearer_tokens as tokens WHERE users.id = tokens.user_id AND tokens.token = '${token}'`;

    const sqlCallback = (err, result) => {
        if (result == null || result.length === 0) {
            console.log("Could not find user by bearerToken: ", token);
            callback(err, result);
        }
        else {
            callback(err, result);
        }
    };
    dbConnection.query(queryString, sqlCallback);
}

function getAllUsers(callback){
    const queryString = 'SELECT * FROM users';

    const sqlCallback = (err, results) => {
        callback(err,results);
    };

    dbConnection.query(queryString, sqlCallback,true);
}

function addAnnulmentTransaction(transactionHash, timestamp) {

    const queryString = `INSERT INTO annulment_transactions (transactionHash, creationDate, executed) VALUES ('${transactionHash}', '${timestamp}', 'false');`;

    const sqlCallback = (error, result) => {

        const isUserRegistered = (result) !== null ? result.length > 0 : null;
        callback(error, isAnnulementRequested);
    };

    dbConnection.query(queryString, sqlCallback);
}

//TODO: Testen
function getHeadTransactionHash(publicKeyCar, callback){
    const queryString = `SELECT headTx FROM kfz WHERE publicKey = '${publicKeyCar}'`;

    const sqlCallback = (err, result) => {
        callback(err,result);
    };

    dbConnection.query(queryString, sqlCallback,true);
}

//TODO: Testen
function updateHeadTransactionHash(publicKeyCar, headTxHash, callback) {

    const queryString = `UPDATE kfz SET headTx = '${headTxHash}' WHERE publicKey = '${publicKeyCar}';`;

    const sqlCallback = (error, result) => {

        const isHeadTxUpdated = (result) !== null ? result.length > 0 : null;
        callback(error, isHeadTxUpdated);
    };

    dbConnection.query(queryString, sqlCallback);
}

function getAnnulmentTransactionsFromDB(callback)
{
    const queryString = `SELECT at.transactionHash, at.rejected, at.user_id, kfz.vin FROM annulment_transactions as at,
                        kfz where kfz.publicKey = (SELECT publicKey from users WHERE id = at.user_id)`;

    const sqlCallback = (error, results) => {
        callback(error, results)
    };

    dbConnection.query(queryString, sqlCallback, true);
}

module.exports = {
    "registerUserInDB": registerUserInDB,
    "registerCarInDB": registerCarInDB,
    "getUserFromCredentials": getUserFromCredentials,
    "doesUserExist": doesUserExist,
    "blockUserInDB": blockUserInDB,
    "getCarAddressFromVin": getCarAddressFromVin,
    "getUserInfoFromToken": getUserInfoFromToken,
    "checkUserAuthorization": checkUserAuthorization,
    "getAllUsers": getAllUsers,
    "getAnnulmentTransactionsFromDB": getAnnulmentTransactionsFromDB,
    "getHeadTransactionHash": getHeadTransactionHash,
    "updateHeadTransactionHash": updateHeadTransactionHash
};