/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST Service. */
router.post('/', function(req, res, next) {
    res.send('Service 1 made='+req.query.service1+' or service 2 made='+req.query.service2+' and/or oil change made='
        +req.query.oilChange+' with mileage: '+req.query.mileage+' at timestamp: '+req.query.timestamp);
});

module.exports = router;