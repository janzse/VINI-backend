/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* GET car by VIN. */
router.get('/', function(req, res, next) {
    res.send('Requested Data for car with vin: ' + req.query.vin);    // echo the result back
});

module.exports = router;