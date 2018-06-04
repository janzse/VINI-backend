/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST Mileage. */
router.post('/', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

module.exports = router;