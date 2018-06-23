import dbHelper from "../database/dbHelper";
import {createUserAccount} from "../blockchain/ethNode";
import {USER_LEVEL, FRONTEND_URL, PASSWORD_LENGTH} from "../utils";
import nodemailer from "nodemailer";
import {MAILACCOUNT} from "../passwords";
import sha256 from 'sha256';
import generator from 'generate-password';

/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
async function registerUser(req, res) {

    if (req.body.email == null || req.body.password == null || req.body.authorityLevel == null ||
        req.body.authLevel == null || req.body.forename == null || req.body.surname == null ||
        req.body.companyName == null || req.body.creationDate == null) {
        console.log("Invalid request on register-user: ", req.body);
        res.status(400);
        res.json({
            "message": "Request has to include: email, password, authorityLevel, forename," +
            "surname, companyName & creationDate in the body and bearer_token in the header"
        });
        return;
    }

    if (req.body.authorityLevel !== USER_LEVEL.ASTVA) {
        res.status(401);
        res.json({
            "message": "User is not authorized to register new user"
        });
        return;
    }

    const doesUserExist = await dbHelper.doesUserExist(req.body.email);
    console.log("Does User Exist: ", doesUserExist);
    if (doesUserExist) {
        res.status(400);
        res.json({
            "message": "Es existiert bereits ein Benutzer mit der E-Mail-Adresse."
        });
        return;
    }

    const userKeys = await createUserAccount();

    if (userKeys == null) {
        console.log("Error while creating new userAccount");
        res.status(500);
        res.json({
            "message": "Error while creating new userAccount"
        });
        return;
    }

    const registerResult = await dbHelper.registerUserInDB(
        req.body.email,
        req.body.password,
        userKeys.privateKey,
        userKeys.publicKey,
        req.body.authLevel,
        req.body.forename,
        req.body.surname,
        req.body.companyName,
        req.body.creationDate,
        false
    );

    if (registerResult == null) {
        res.status(500);
        res.json({
            "message": "Fehler bei der Registrierung."
        });
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD
        }
    });

    const mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: req.body.email,
        subject: 'Ihre Zugangsdaten für VINI',
        text: 'Sehr geehrte Damen und Herren,' +
        '\n\nherzlich Willkommen bei VINI, dem digitalen Scheckheft. Es ist ein Benutzerkonto für Sie angelegt ' +
        'worden. Ihre Zugangsdaten lauten:\nLogin: ' + req.body.email + '\nPasswort: ' + req.body.password +
        '\n\nBitte logen Sie sich auf folgender URL ein: ' + FRONTEND_URL +
        '\n\nDies ist eine automatisch erstellte E-Mail. Bitte antworten Sie nicht auf diese E-Mail. Bei Fragen ' +
        'oder Unklarheiten wenden Sie sich bitte an das nächste für Sie zuständige Straßenverkehrsamt.' +
        '\n\nMit freundlichen Grüßen\n\nVINI - Ihr digitales Scheckheft'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(400);
            res.send({
                "message": "Benutzer wurde erfolgreich angelegt. Die E-Mail konnte allerdings nicht gesendet werden."
            });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200);
            res.send({
                "message": "Neuer Benutzer wurde registriert. Eine E-Mail mit Zugangsdaten wurde versendet."
            });
        }
    });
}

async function blockUser(req, res) {

    if (req.body.email == null) {
        console.log("Invalid request on register-user: ", req.body);
        res.status(400);
        res.send({
            "message": "Request has to include: email in the body and bearer_token in the header"
        });
        return;
    }
    const email = req.body.email;

    if (req.body.authorityLevel !== USER_LEVEL.ASTVA) {
        res.status(401);
        res.json({
            "message": "User is not authorized to block user"
        });

        return;
    }

    const doesUserExists = await dbHelper.doesUserExist(email);

    if (!doesUserExists) {
        res.status(400);
        res.send({
            "message": "Der Benutzer wurde nicht gefunden."
        });

        return;
    }

    const blockResult = await dbHelper.blockUserInDB(email);

    if (blockResult != null && blockResult.length === 0) {
        res.status(200);
        res.json({
            "message": "Der Benutzer wurde erfolgreich entfernt."
        });
    }
    else {
        res.status(500);
        res.json({
            "message": "Der Benutzer konnte aufgrund eines Serverfehlers nicht gelöscht werden."
        });
    }
}

//VINI.de/api/users
async function getUsers(req, res) {

    if (req.body.authorityLevel !== USER_LEVEL.ASTVA) {
        res.status(401);
        res.json({
            "message": "User is not authorized to retrieve user data"
        });

        return;
    }

    const users = await dbHelper.getAllUsers();

    if (users != null) {
        res.status(200);
        res.json({
            "users": users
        });
    }
    else {
        res.status(500);
        res.json({"message": "Datenbankverbindung fehlgeschlagen."});
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
        errorHandling(res, 406, "No bearer_token found in header.");
        return;
    }
    const token = req.get("Authorization").slice("Bearer ".length);

    // Prüfen, ob der User deaktiviert ist
    const authResult = await dbHelper.checkUserAuthorization(token);

    if (authResult == null || authResult.length === 0) {
        errorHandling(res, 403, "Bitte neu einloggen.");
    }
    else if ((Date.parse(authResult[3]) - Date.now()) < 0) {
        errorHandling(res, 401, "Das Bearer-Token ist abgelaufen.");
    }
    else if (authResult[0] === true) {
        errorHandling(res, 401, "Der Benutzer wurde blockiert.");
    }
    else {
        req.body.blocked = authResult[0];
        req.body.authorityLevel = authResult[2];
        console.log("Check user authorization result: ", req.body.blocked, req.body.authorityLevel);
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

async function resetPassword(req, res) {

    if (req.body.email == null) {
        console.log("Invalid request on register-user: ", req.body.email);
        res.status(400);
        res.send({
            "message": "Request has to include: email in the body"
        });
        return;
    }
    console.log("Email: ", req.body.email);

    const doesUserExist = await dbHelper.doesUserExist(req.body.email);
    if (!doesUserExist) {
        console.log("User does not exist.");
        res.status(400);
        res.send({
            "message": "E-Mail-Adresse unbekannt."
        });
        return;
    }

    /*let password = generator.generate({
        length: PASSWORD_LENGTH,
        numbers: true
    });*/
    let password = 'abc123';
    console.log("Password: ", password);
    const resultPasswordUpdate = dbHelper.updatePassword(req.body.email, sha256(password));
    if (resultPasswordUpdate == null) {
        console.log("Password could not be updated.");
        res.status(400);
        res.send({
            "message": "Das Passwort konnte nicht erneuert werden."
        });
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD
        }
    });

    console.log("Login: ", MAILACCOUNT.LOGIN, " Passwort: ", MAILACCOUNT.PASSWORD);

    let mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: req.body.email,
        subject: 'Ihr neues Passwort für VINI',
        text: 'Sehr geehrte Damen und Herren,' +
        '\n\nSie haben ein neues Passwort angefordert. Ihre neuen Zugangsdaten lauten:' +
        '\nLogin: ' + req.body.email + '\nPasswort: ' + password +
        '\n\nBitte logen Sie sich auf folgender URL ein: ' + FRONTEND_URL +
        '\n\nDies ist eine automatisch erstellte E-Mail. Bitte antworten Sie nicht auf diese E-Mail. Bei Fragen ' +
        'oder Unklarheiten wenden Sie sich bitte an das nächste für Sie zuständige Straßenverkehrsamt.' +
        '\n\nMit freundlichen Grüßen\n\nVINI - Ihr digitales Scheckheft'
    };

    /*transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Email not sent.', error);
            res.status(400);
            res.send({
                "message": "E-Mail konnte nicht gesendet werden."
            });
        } else {*/
    console.log('Email sent: ' + info.response);
    res.status(200);
    res.send({
        "message": "Passwort wurde geändert. Eine E-Mail mit dem neuen Passwort wurde zugesendet."
        /*});
    }*/
    });
}

module.exports = {
    "registerUser": registerUser,
    "login": login,
    "isAuthorised": isAuthorised,
    "blockUser": blockUser,
    "getUsers": getUsers,
    "errorHandling": errorHandling,
    "resetPassword": resetPassword
};