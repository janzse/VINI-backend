import express from "express";
const router = express.Router();
import userDBHelper from "../database/userDBHelper";

/* GET users listing. */
router.get('/', function (req, res, next) {

  // Read user information from req-Object
  userDBHelper.getUserFromCredentials("user1", "abc", (result) => {
    res.json(result)
  });

});

router.put('/', function (req, res, next) {
  // Your code here
});

module.exports = router;
