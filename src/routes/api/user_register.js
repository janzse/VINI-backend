/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST user register. */
router.post('/', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

/* DELETE user register. */
router.delete('/', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

module.exports = router;