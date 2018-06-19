import dbHelper from "../database/dbHelper";
import { createUserAccount } from "../blockchain/ethNode";

/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
async function registerUser(req, res) {

    if (req.body.email == null || req.get("Authorization") == null || req.body.password == null ||
        req.body.authorityLevel == null || req.body.forename == null || req.body.surname == null ||
        req.body.companyName == null || req.body.creationDate == null) {
        console.log("Invalid request on register-user: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: email, password, authorityLevel, forename," +
                "surname, companyName & creationDate in the body and bearer_token in the header"
        });
        return;
    }

    const doesUserExist = await dbHelper.doesUserExist(req.body.email);

    if (doesUserExist) {
        res.status(400);
        res.json({
            "message": "User with email <" + req.body.email + "> already exists"
        });

        return;
    }

    const userKeys = createUserAccount();

    const registerResult = dbHelper.registerUserInDB(
        req.body.email,
        req.body.password,
        userKeys.privateKey,
        userKeys.publicKey,
        req.body.authorityLevel,
        req.body.forename,
        req.body.surname,
        req.body.companyName,
        req.body.creationDate,
        false
    );

    if (registerResult == null) {
        res.status(500);
        res.json({
            "message": "Failed to register user due to a server error"
        });
    }
    else {
        res.status(200);
        res.json({
            "message": "Registration was successful"
        });
    }
}

async function blockUser(req, res) {

    const email = req.body.email;

    if (email == null || req.get("Authorization") == null) {
        console.log("Invalid request on register-user: ", req.body, req.get("Authorization"));
        res.status(400);
        res.send({
            "message": "Request has to include: email in the body and bearer_token in the header"
        });
        return;
    }

    const doesUserExists = await dbHelper.doesUserExist(email);

    if (!doesUserExists) {
        res.status(400);
        res.send({
            "message": "User with email " + email + " does not exist"
        });

        return;
    }

    const blockResult = await dbHelper.blockUserInDB(email);

    if (blockResult != null && blockResult.length === 0) {
        res.status(200);
        res.json({
            "message": "Block was successful"
        });
    }
    else {
        res.status(500);
        res.json({
            "message": "Failed to block user due to a server error"
        });
    }
}

//VINI.de/api/users
async function getUsers(req, res) {

    //CHECK DB-Connection: if available - return select all result; if not return dummy values

    const users = await dbHelper.getAllUsers();

    if (users != null) {
        res.status(200);
        res.json({
            "users": users
        });
    }
    else {
        //send dummy
        let transactionPayload = [];

        const payloadItem1 = {
            date: "11.06.2008",
            forename: "Ernst",
            surname: "Mustermann",
            authorityLevel: "TUEV",
            action: "dummy",
            email: "queryMail",
            company: "TUEV"
        };
        const payloadItem2 = {
            date: "11.06.2018",
            forename: "Brigitte",
            surname: "Mustermann",
            authorityLevel: "ZWS",
            action: "dummy",
            email: "queryMail",
            company: "KFZ Bongard"
        };
        const payloadItem3 = {
            date: "11.06.2018",
            forename: "Johnathan",
            surname: "Mustermann",
            authorityLevel: "STVA",
            action: "dummy",
            email: "queryMail",
            company: "Amt X"
        };
        const payloadItem4 = {
            date: "12.06.2018",
            forename: "Gabi",
            surname: "Mustermann",
            authorityLevel: "ASTVA",
            action: "dummy",
            email: "queryMail",
            company: "Amt Y"
        };

        transactionPayload.push(payloadItem1);
        transactionPayload.push(payloadItem2);
        transactionPayload.push(payloadItem3);
        transactionPayload.push(payloadItem4);

        res.json({
            transactionPayload
        });
    }
}


function login(req, res) {
    console.log("Authorization successful");
    let status = req.body.blocked !== null && req.body.blocked === false ? "success" : "failure";
    let authLevel = req.body.authorityLevel !== null ? req.body.authorityLevel : 0;

    const loginBody = {
        loginStatus: status,
        authorityLevel: authLevel
    };

    res.status(200);
    res.json(loginBody);
}

async function isAuthorised(req, res, next) {

    if (req.get("Authorization") == null) {
        errorHandling(res, 406, "No valid bearer token found");
        return;
    }
    const token = req.get("Authorization").slice("Bearer ".length);
    console.log("TOKEN: ", token);

    // Prüfen, ob der User deaktiviert ist
    const authResult = await dbHelper.checkUserAuthorization(token);

    if (authResult == null || authResult.length === 0) {
        errorHandling(res, 403, "No result from user authorization");
    }
    else if (authResult[0] === true) {
        errorHandling(res, 401, "User is blocked");
    }
    else {
        const userBody = {
            id: authResult[1],
            blocked: authResult[0],
            authorityLevel: authResult[2],
            expiration: authResult[3]
        };
        console.log("Check user authorization result: ", userBody);
        req.body = userBody;
        next();
    }
}

function errorHandling(response, status, message) {
    const url = require('url');
    const query = url.format({
        pathname: '/error',
        query: {
            "status": status,
            "message": message
        }
    });

    response.redirect(query);
}


module.exports = {
    "registerUser": registerUser,
    "login": login,
    "isAuthorised": isAuthorised,
    "blockUser": blockUser,
    "getUsers": getUsers,
    "errorHandling": errorHandling
};