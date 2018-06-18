import express from "express";
import restrictedAreaRoutesMethods from "../authorisation/restrictedAreaRoutesMethods";

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('My fancy page')
});

/* POST to validate accessToken */
router.post("/enter", restrictedAreaRoutesMethods.accessRestrictedArea);

router.get('/error', (req, res, next) => {
  if (req.url !== null) {
      let uri = decodeURIComponent(req.url).toString();
      uri = uri.slice('/error?status='.length);
      let status = uri.substring(0, 3);
      let message = uri.substring(uri.indexOf('=', 1) + 1, uri.length);

      res.json({
          'status': status,
          'message': message
      });
  }
});

module.exports = router;
