/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST apply cancel transaction. */
router.post('/', function(req, res, next) {
    res.send('Cancel request for transaction with ID: '+req.query.transactionId+' applied at timestamp '
        +req.query.timestamp);
});

module.exports = router;