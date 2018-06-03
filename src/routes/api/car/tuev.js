/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST tuev. */
router.post('/', function(req, res, next) {
    res.send('Tuev made at mileage: '+req.query.mileage+' at timestamp: '+req.query.timestamp+
        '. Latest next tuev date: '+req.query.nextCheck);
});

module.exports = router;