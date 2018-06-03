import userDBHelper from "../database/userDBHelper";

/* handles the api call to register the user and insert them into the users table.
  The req body should contain a username and password. */
function registerUser(req, res){

  console.log("authRoutesMethods: registerUser: req.body is:", req.body);

  //query db to see if the user exists already
  userDBHelper.doesUserExist(req.body.username, (doesUserExist) => {

    //check if the user exists
    if (doesUserExist){

      res.status(409); //TODO: Richtiger Ret-Code?
      res.json({
        "message": "User already exists"
      });

      return
    }

    //register the user in the db
    userDBHelper.registerUserInDB(req.body.username, req.body.password, result => {

      if(result.length === 0){
        res.status(200);
        res.json({
          "message": "Registration was successful"
        })
      }
      else{
        res.status(500);
        res.json({
          "message": "Failed to register user"
        })
      }
    })
  })
}

function login(registerUserQuery, res){

  console.log("User login");

}


module.exports =  {
  "registerUser": registerUser,
  "login": login
};