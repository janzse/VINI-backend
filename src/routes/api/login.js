/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST Login. */
router.post('/', function(req, res, next) {
    res.send('Login with user: '+req.query.email+' and password: '+req.query.password);
});

module.exports = router;