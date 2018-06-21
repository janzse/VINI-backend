import express from "express";

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect("https://sgse18.github.io/VINI/");
});

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
