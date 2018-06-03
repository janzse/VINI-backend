/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST cancel transaction. */
router.post('/', function(req, res, next) {
    res.send('Cancel request for transaction with ID: '+req.query.transactionId+' issued at timestamp '
        +req.query.timestamp);
});

module.exports = router;