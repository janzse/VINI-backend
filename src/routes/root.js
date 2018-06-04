import express from "express";
import restrictedAreaRoutesMethods from "../authorisation/restrictedAreaRoutesMethods";

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('My fancy page')
});

/* POST to validate accessToken */
router.post("/enter", restrictedAreaRoutesMethods.accessRestrictedArea);


module.exports = router;
