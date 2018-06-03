/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* POST user register. */
router.post('/', function(req, res, next) {
    res.send('Register with user: '+req.query.email+' and password: '+req.query.password+' and confirmPassword: '
        +req.query.confirmPassword);
});

/* DELETE user register. */
router.delete('/', function(req, res, next) {
    res.send('Delete user: '+req.query.email);
});

module.exports = router;