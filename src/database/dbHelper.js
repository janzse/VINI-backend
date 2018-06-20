import dbConnection from "./msSqlWrapper";
import {getTimestamp, toBasicString} from "../utils";

async function registerUserInDB(email, password, privateKey, publicKey, authorityLevel, forename, surname, companyName, creationDate, blocked) {

    const queryString = `INSERT INTO users (email, password, privateKey, publicKey, authorityLevel, forename, surname, companyName,
  creationDate, blocked) VALUES ('${email}', '${password}', '${toBasicString(privateKey)}', '${toBasicString(publicKey)}', '${authorityLevel}', '${forename}', '${surname}', '${companyName}', '${creationDate}', '${blocked}');`;

    return await dbConnection.query(queryString);
}

async function registerCarInDB(vin, privateKey, publicKey, creationDate) {

    const queryString = `INSERT INTO kfz (vin, privateKey, publicKey, creationDate) VALUES ('${vin}', '${toBasicString(privateKey)}', '${toBasicString(publicKey)}', '${creationDate}')`;

    return await dbConnection.query(queryString);
}

async function updateCarHeadTx(publicKey, hash) {

    const queryString = `UPDATE kfz SET headTx = '${hash}' WHERE publicKey = '${toBasicString(publicKey)}'`;

    return await dbConnection.query(queryString);
}

async function getUserFromCredentials(email, password) {

    const queryString = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        console.log("Invalid credentials");
        return null;
    }

    //TODO: Prüfen, was alles für das Client-Objekt im weiteren Verlauf
    return {
        "id": result[0],
        "email": result[1],
        "password": result[2]
    };
}

async function doesUserExist(email) {

    const queryString = `SELECT * FROM users WHERE email = '${email}'`;

    const results = await dbConnection.query(queryString);

    return results.length !== 0;
}

async function blockUserInDB(email) {
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

    return await dbConnection.query(query);
}

async function getCarAddressFromVin(vin) {

    const queryString = `SELECT publicKey FROM kfz WHERE vin = '${vin}'`;

    const result = await dbConnection.query(queryString);

    if (result != null && result.length > 0) {
        return result[0];
    }

    return null;
}

async function getUserInfoFromToken(token) {
    const queryString = `SELECT privateKey, publicKey, email FROM users WHERE id = (SELECT user_id FROM bearer_tokens WHERE token = '${token}')`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    return {
        "privateKey": result[0],
        "address": result[1],
        "email": result[2]
    }
}

async function checkUserAuthorization(token) {
    const queryString = `SELECT users.blocked, users.id, users.authorityLevel, tokens.expiration FROM users, bearer_tokens as tokens WHERE users.id = tokens.user_id AND tokens.token = '${token}'`;

    return await dbConnection.query(queryString);
}

async function getAllUsers() {
    const queryString = `SELECT * FROM users WHERE users.blocked = 'false'`;

    const results = await dbConnection.query(queryString);

    if (results == null) {
        return null;
    }

    // Cut array into right size
    let users = [];

    for (let i = 0; i < results.length; i += 11) {
        users.push(results.slice(i, i + 11));
    }

    return users.map(element => {
        return {
            date: element[8],
            forename: element[5],
            surname: element[6],
            authorityLevel: element[4],
            email: element[1],
            company: element[7]

        };
    });
}

//TODO: Auf async/await ändern, sofern verwendet
function addAnnulmentTransaction(transactionHash, timestamp) {

    const queryString = `INSERT INTO annulment_transactions (transactionHash, creationDate, executed) VALUES ('${transactionHash}', '${timestamp}', 'false');`;

    const sqlCallback = (error, result) => {

        const isUserRegistered = (result) !== null ? result.length > 0 : null;
        callback(error, isAnnulementRequested);
    };

    dbConnection.query(queryString, sqlCallback);
}

async function getHeadTransactionHash(publicKeyCar) {
    const queryString = `SELECT headTx FROM kfz WHERE publicKey = '${toBasicString(publicKeyCar)}'`;

    const result = await dbConnection.query(queryString);

    if(result == null || result.length === 0){
        return null;
    }

    return result[0];
}

async function updateHeadTransactionHash(publicKeyCar, headTxHash) {

    const queryString = `UPDATE kfz SET headTx = '${headTxHash}' WHERE publicKey = '${toBasicString(publicKeyCar)}';`;

    return await dbConnection.query(queryString);
}

async function getAllAnnulmentTransactions() {
    const queryString = `SELECT at.transactionHash, at.pending, at.user_id, kfz.vin FROM annulment_transactions as at,
                        kfz where kfz.publicKey = (SELECT publicKey from users WHERE id = at.user_id)`;

    return await dbConnection.query(queryString);
}

async function getAnnulment(hash, user_id){

    const queryString = `SELECT * FROM annulment_transactions WHERE transactionHash = '${toBasicString(hash)}' AND user_id = ${user_id}`;

    return await dbConnection.query(queryString);
}

async function insertAnnulment(hash, user_id){

    const queryString = `INSERT INTO annulment_transactions (transactionHash, pending, creationDate, user_id) VALUES ('${toBasicString(hash)}', 1, '${getTimestamp()}', ${user_id})`;

    return await dbConnection.query(queryString);
}

async function rejectAnnulment(hash, user_id){

    const queryString = `DELETE FROM annulment_transactions WHERE transactionHash = '${hash}' AND user_id = ${user_id}`;

    return await dbConnection.query(queryString);
}


module.exports = {
    "registerUserInDB": registerUserInDB,
    "registerCarInDB": registerCarInDB,
    "updateCarHeadTx": updateCarHeadTx,
    "getUserFromCredentials": getUserFromCredentials,
    "doesUserExist": doesUserExist,
    "blockUserInDB": blockUserInDB,
    "getCarAddressFromVin": getCarAddressFromVin,
    "getUserInfoFromToken": getUserInfoFromToken,
    "checkUserAuthorization": checkUserAuthorization,
    "getAllUsers": getAllUsers,
    "getAllAnnulmentTransactions": getAllAnnulmentTransactions,
    "getHeadTransactionHash": getHeadTransactionHash,
    "updateHeadTransactionHash": updateHeadTransactionHash,
    "getAnnulment": getAnnulment,
    "insertAnnulment": insertAnnulment,
    "rejectAnnulment": rejectAnnulment
};