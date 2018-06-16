import dbHelper from "../database/dbHelper";
import {createUserAccount, createCarAccount} from "../blockchain/ethNode";


/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
function registerUser(req, res) {

    console.log("registerUser: req.body is:", req.body);

    dbHelper.doesUserExist(req.body.email, (doesUserExist) => {

        if (doesUserExist) {
            res.status(400);
            res.json({
                "message": "User already exists"
            });

            return;
        }

        const userKeys = createUserAccount();

        //TODO: Alle Werte in die DB schreiben
        dbHelper.registerUserInDB(req.body.email, req.body.password, req.body.privateKey, req.body.publicKey, req.body.authorityLevel,
            req.body.forename, req.body.surname, req.body.companyName, req.body.creationDate, req.body.blocked,
            (hasError, rowCount) => {

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
            })
    })
}

function deleteUser(req, res) {
    console.log("registerUser: req.body is:", req.body);

    dbHelper.doesUserExist(req.body.email, (doesUserExist) => {
        if (doesUserExist) {
            dbHelper.deleteUserFromDB(req.body.email, (err, isUserDeleted) => {
                if (isUserDeleted) {
                    res.status(200);
                    res.json({
                        "message": "Deletion was successful"
                    })
                }
                else {
                    console.log("Error while deleting user: ", err);
                    res.status(500);
                    res.json({
                        "message": "Failed to delete user due to a server error"
                    })
                }
            })
        }
        else {
            res.status(400);
            res.json({
                "message": "User does not exists"
            });
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


function login(registerUserQuery, res) {

    console.log("User login successful");
    res.send(JSON.parse('{"temp": "User login successful" }')); // TODO
}

let app;

//FIXME: Das herumreichen der "app" Instanz ist sehr unschön.
// success ist die Funktion, die aufgerufen wird, wenn die Authorisierung geglückt ist.
// TODO: Fehlerfälle
function isAuthorised(req, res, success) {
    app.oauth.authorise()(req, res, (authResult) => {

        if (authResult.bearerToken != null) {
            console.log("TOKEN: ", authResult.bearerToken);

            // Prüfen, ob der User deaktiviert ist und
            dbHelper.checkUserAuthorization(authResult.bearerToken, (error, result) => {
                if (error) {
                    console.log("User authorization error: ", error);
                    //error(); // TODO
                }
                else
                {
                    if (result.length === 0)
                    {
                        console.log("No result from user authorization");

                        //error(); // TODO
                    }
                    else
                    {
                        if (result[0] == false) {
                            console.log("User is blocked");
                            error(); // TODO
                        }
                        success();
                    }
                }
            })
        }
        else {
            console.log("No valid accessToken found");
            res.status(403);
            res.redirect("/");
            // TODO error(); ??
        }
    })
}

module.exports = {
    "setApp": (expressApp) => {
        app = expressApp
    },
    "registerUser": registerUser,
    "login": login,
    "isAuthorised": isAuthorised,
    "deleteUser": deleteUser,
    "getUsers": getUsers
};