/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* GET car by VIN. */
router.get('/', function(req, res, next) {
    res.send('Car with VIN: '+req.query.vin);
});

module.exports = router;