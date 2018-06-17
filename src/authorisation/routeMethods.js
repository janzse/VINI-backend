import dbHelper from "../database/dbHelper";
import {createUserAccount, createCarAccount} from "../blockchain/ethNode";


/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
function registerUser(req, res) {

    if (req.body.email == null || req.get("Authorization") == null || req.body.password == null ||
        req.body.authorityLevel == null || req.body.forename == null || req.body.surname == null ||
        req.body.companyName == null || req.body.creationDate == null) {
        console.log("Invalid request on register-user: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: email, password, authorityLevel, forename," +
            "surname, companyName & creationDate in the body and bearer_token in the header"
        });
        return false;
    }

    dbHelper.doesUserExist(req.body.email, (doesUserExist) => {
        console.log("UserExist: ", doesUserExist);
        if (doesUserExist !== null) {
            res.status(400);
            res.json({
                "message": "User already exists"
            });

            return false;
        }
        console.log("test");
        const userKeys = createUserAccount();
        console.log("test2");
        //TODO: Alle Werte in die DB schreiben
        dbHelper.registerUserInDB(req.body.email, req.body.password, userKeys.privateKey, userKeys.publicKey,
            req.body.authorityLevel, req.body.forename, req.body.surname, req.body.companyName, req.body.creationDate,
            req.body.blocked, (hasError, rowCount) => {

            if (!hasError) {
                res.status(200);
                res.json({
                    "message": "Registration was successful"
                })
            }
            else {
                res.status(500);
                res.json({
                    "message": "Failed to register user due to a server error"
                })
            }
        });
        console.log("test3");
    })
}

function deleteUser(req, res) {

    if (req.body.email == null || req.get("Authorization") == null) {
        console.log("Invalid request on register-user: ", req.body, req.get("Authorization"));
        res.status(400);
        res.send({
            "message": "Request has to include: email in the body and bearer_token in the header"
        });
        return false;
    }

    dbHelper.doesUserExist(req.body.email, (doesUserExist) => {
        if (doesUserExist !== null) {
            dbHelper.deleteUserFromDB(req.body.email, (err, isUserDeleted) => {
                console.log("isUserDeleted: ", isUserDeleted);
                if (isUserDeleted !== null) {
                    res.status(200);
                    res.send(({"message": "Deletion was successful"}))
                    return;
                }
                else {
                    console.log("Error while deleting user: ", err);
                    res.status(500);
                    res.send({
                        "message": "Failed to delete user due to a server error"
                    })
                    return;
                }
            })
        }
        else {
            res.status(400);
            res.send({
                "message": "User does not exists"
            });
            return;
        }
    })
}


//DUMMY FUNCTION!!!!
//VINI.de/api/users
function getUsers(req, res) {

    //CHECK DB-Connection: if available - return select all result; if not return dummy values
    /*
    dbHelper.getAllUsers((err, results) => {
            if(result.length > 0){

                //TODO convert results to appropriate JSON
                res.send(results);
                return true;
            }
        }
    );
*/
    //DUMMY

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
    const msg = JSON.stringify({transactionPayload});
    res.send(msg);
}


function login(req, res) {

    // read bearertoken from 
    // TODO check user in db, auth level etc.
    console.log("User login successful");
    
    const dummyBody = {
        loginStatus: "success", // could not log in --> "failure"
        token: "a74b0debd96954f807451074ac3eefe7918f1b7b",
        authorityLevel: 1
    }

    res.send(dummyBody); // TODO
}

let app;

//FIXME: Das herumreichen der "app" Instanz ist sehr unschön.
// success ist die Funktion, die aufgerufen wird, wenn die Authorisierung geglückt ist.
// TODO: Fehlerfälle
function isAuthorised(req, res, next) {
    const token = req.get("Authorization").slice("Bearer ".length)

    if (token != null) {
        console.log("TOKEN: ", token);

        // Prüfen, ob der User deaktiviert ist
        dbHelper.checkUserAuthorization(token, (error, result) => {
            if (error)
                errorHandling(res, 400, `User authorization error: '${error}'`);
            else {
                if (result.length === 0)
                    errorHandling(res, 403, "No result from user authorization");
                else {
                    if (result[0] === true)
                        errorHandling(res, 401, "User is blocked");
                    else {
                        const body = {
                            id: result[1],
                            blocked: result[0],
                            authorityLevel: result[2],
                            expiration: result[3]
                        }
                        res.json(body);
                    }
                }
            }
        })
    }
    else {
        errorHandling(res, 406, "No valid accessToken found")
    }
}

function errorHandling(response, status, message)
{
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
    "setApp": (expressApp) => {
        app = expressApp
    },
    "registerUser": registerUser,
    "login": login,
    "isAuthorised": isAuthorised,
    "deleteUser": deleteUser,
    "getUsers": getUsers,
    "errorHandling": errorHandling
};