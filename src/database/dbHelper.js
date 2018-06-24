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

async function getUserFromCredentials(email, password) {

    const queryString = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        console.log("Invalid credentials");
        return null;
    }

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
    const queryString = `SELECT * FROM users WHERE id = (SELECT user_id FROM bearer_tokens WHERE token = '${token}')`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    return {
        "id": result[0],
        "email": result[1],
        "privateKey": result[3],
        "authorityLevel": result[4],
        "forename": result[5],
        "surname": result[6],
        "companyName": result[7],
        "creationDate": result[8],
        "blocked": result[9],
        "publicKey": result[10]
    }
}

async function getUserInfoFromUserId(userId) {
    const queryString = `SELECT * FROM users WHERE id = ${userId}`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    return {
        "id": result[0],
        "email": result[1],
        "privateKey": result[3],
        "authorityLevel": result[4],
        "forename": result[5],
        "surname": result[6],
        "companyName": result[7],
        "creationDate": result[8],
        "blocked": result[9],
        "publicKey": result[10]
    }
}

async function updatePassword(email, passwordHash) {
    const queryString = `UPDATE users SET password = '${passwordHash}' WHERE email = '${email}'`;

    return await dbConnection.query(queryString);
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

async function getHeadTransactionHash(publicKeyCar) {
    const queryString = `SELECT headTx FROM kfz WHERE publicKey = '${toBasicString(publicKeyCar)}'`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    return result[0];
}

async function updateHeadTransactionHash(publicKeyCar, headTxHash) {

    const queryString = `UPDATE kfz SET headTx = '${toBasicString(headTxHash)}' WHERE publicKey = '${toBasicString(publicKeyCar)}';`;

    return await dbConnection.query(queryString);
}

async function getAllAnnulmentTransactions() {

    // Selects all information from annulment_transactions plus the email address which belongs to the user_id
    const queryString = `SELECT at.transactionHash, at.pending, at.creationDate, at.vin, at.applicant, users.email FROM annulment_transactions AS at, users WHERE at.user_id = users.id`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    let allAnnulments = [];

    for (let i = 0; i < result.length; i += 6) {
        allAnnulments.push({
            "transactionHash": result[i],
            "pending": result[i + 1],
            "creationDate": result[i + 2],
            "vin": result[i + 3],
            "applicant": result[i + 4],
            "creator": result[i + 5]
        });
    }

    return allAnnulments;
}

async function getAnnulment(hash) {

    // Selects all information from annulment_transactions plus the email address which belongs to the user_id for a specific transactionHash
    const queryString = `SELECT at.transactionHash, at.pending, at.creationDate, at.vin, at.applicant, users.email FROM annulment_transactions AS at, users WHERE at.user_id = users.id AND transactionHash = '${toBasicString(hash)}'`;

    const result = await dbConnection.query(queryString);

    if (result == null || result.length === 0) {
        return null;
    }

    return {
        "transactionHash": result[0],
        "pending": result[1],
        "creationDate": result[2],
        "vin": result[3],
        "applicant": result[4],
        "creator": result[5]
    }
}

async function insertAnnulment(hash, user_id, vin) {

    const queryString = `INSERT INTO annulment_transactions (transactionHash, pending, creationDate, user_id, vin, applicant) VALUES ('${toBasicString(hash)}', 1, '${getTimestamp()}', ${user_id}, '${vin}', NULL)`;

    return await dbConnection.query(queryString);
}

async function rejectAnnulment(hash) {

    const queryString = `DELETE FROM annulment_transactions WHERE transactionHash = '${hash}'`;

    return await dbConnection.query(queryString);
}

async function acceptAnnulment(hash, applicant) {

    const queryString = `UPDATE annulment_transactions SET pending = 0, applicant = '${applicant}' WHERE transactionHash = '${toBasicString(hash)}'`;

    return await dbConnection.query(queryString)
}

async function getVinByPublicKey(publicKey) {
    const queryString = `SELECT vin from kfz WHERE publicKey = '${toBasicString(publicKey)}'`;

    return await dbConnection.query(queryString);
}

async function getUserByID(userID) {
    const queryString = `SELECT email from users WHERE id = '${userID}'`;

    return await dbConnection.query(queryString);
}


module.exports = {
    "registerUserInDB": registerUserInDB,
    "registerCarInDB": registerCarInDB,
    "getUserFromCredentials": getUserFromCredentials,
    "doesUserExist": doesUserExist,
    "blockUserInDB": blockUserInDB,
    "getCarAddressFromVin": getCarAddressFromVin,
    "getUserInfoFromToken": getUserInfoFromToken,
    "getUserInfoFromUserId": getUserInfoFromUserId,
    "checkUserAuthorization": checkUserAuthorization,
    "getAllUsers": getAllUsers,
    "getAllAnnulmentTransactions": getAllAnnulmentTransactions,
    "getHeadTransactionHash": getHeadTransactionHash,
    "updateHeadTransactionHash": updateHeadTransactionHash,
    "getAnnulment": getAnnulment,
    "insertAnnulment": insertAnnulment,
    "rejectAnnulment": rejectAnnulment,
    "acceptAnnulment": acceptAnnulment,
    "getVinByPublicKey": getVinByPublicKey,
    "getUserByID": getUserByID,
    "updatePassword": updatePassword
};
