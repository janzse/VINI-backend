/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* GET car by VIN. */
router.get('/', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

module.exports = router;