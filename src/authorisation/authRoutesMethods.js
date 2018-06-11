import userDBHelper from "../database/userDBHelper";
import accessTokensDBHelper from "../database/accessTokensDBHelper";

/* handles the api call to register the user and insert them into the users table.
  The req body should contain an email and a password. */
function registerUser(req, res) {

  console.log("registerUser: req.body is:", req.body);

  userDBHelper.doesUserExist(req.body.email, (doesUserExist) => {

    if (doesUserExist) {
      res.status(400);
      res.json({
        "message": "User already exists"
      });

      return;
    }

    userDBHelper.registerUserInDB(req.body.email, req.body.password, req.body.privateKey, req.body.authorityLevel, req.body.forename, req.body.surname, req.body.companyName, req.body.creationDate, req.body.blocked, (hasError, rowCount) => {

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

  userDBHelper.doesUserExist(req.body.email, (doesUserExist) => {
    if (doesUserExist) {
      userDBHelper.deleteUserFromDB(req.body.email, result => {
        if (result.length === 0) {
          res.status(200);
          res.json({
            "message": "Deletion was successful"
          })
        }
        else {
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
      })

      return;
    }
  })
}

//DUMMY FUNCTION!!!!
//VINI.de/api/users/get
function getUser(req, res) {
  var transactionPayload = [];


  var payloadItem1 = {
    date: "11.06.2008",
    forename: "Ernst",
    surname: "Mustermann",
    authorityLevel: "tuev",
    action: "dummy",
    email: queryMail,
    company: "TUEV"
  };
  var payloadItem2 = {
    date: "11.06.2018",
    forename: "Brigitte",
    surname: "Mustermann",
    authorityLevel: "zws",
    action: "dummy",
    email: queryMail,
    company: "KFZ Bongard"
  };
  var payloadItem3 = {
    date: "11.06.2018",
    forename: "Johnathan",
    surname: "Mustermann",
    authorityLevel: "stva",
    action: "dummy",
    email: queryMail,
    company: "Amt X"
  };
  var payloadItem4 = {
    date: "12.06.2018",
    forename: "Gabi",
    surname: "Mustermann",
    authorityLevel: "astva",
    action: "dummy",
    email: queryMail,
    company: "Amt Y"
  };

  transactionPayload.push(payloadItem1);
  transactionPayload.push(payloadItem2);
  transactionPayload.push(payloadItem3);
  transactionPayload.push(payloadItem4);

  res.send(JSON.stringify(transactionPayload));
  }

function login(registerUserQuery, res) {

  console.log("User login successful");

}

let app;

//TODO: Das herumreichen der "app" Instanz ist sehr unschön. FIXME!

function isAuthorised(req, res, next) {
  const authResult = app.oauth.authorise()(req, res, next);

  if (authResult.bearerToken != null) {
    console.log("TOKEN: ", authResult.bearerToken);

      // Validierung der Nutzerrechte (authorisation Level)
      accessTokensDBHelper.getUserIDFromAccessToken(authResult.bearerToken, (userID) => {
          if (error)
          {
              res.status(500);
              res.json({
                  "message": "No compatible UserID for this bearer token"
              })
          }
          // Prüfen, ob der User deaktiviert ist
          userDBHelper.isUserBlocked(userID, error, result => {
              if (error)
              {
                  res.status(500);
                  res.json({
                      "message": "User is blocked"
                  })
              }
              console.log('AUSGABE: ' + result);
          })
      })
  }
  else {
    console.log("No valid accessToken found");
    res.status(403);
    res.redirect("/");
  }
}

module.exports = {
  "setApp": (expressApp) => { app = expressApp },
  "registerUser": registerUser,
  "login": login,
  "isAuthorised": isAuthorised,
  "deleteUser": deleteUser,
  "getUser": getUser
};