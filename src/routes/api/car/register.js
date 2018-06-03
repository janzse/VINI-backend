/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST car registration. */
router.post('/', function(req, res, next) {
    res.send('Car registred the '+req.query.ownerCount+'th time with mileage: '+req.query.mileage+' at timestamp: '
        +req.query.timestamp);
});

module.exports = router;