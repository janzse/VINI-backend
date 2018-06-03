/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST Mileage. */
router.post('/', function(req, res, next) {
    res.send('Mileage: '+req.query.mileage+' at timestamp: '+req.query.timestamp);
});

module.exports = router;