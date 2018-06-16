import routeMethods from "../../car/routeMethods";

/**
 *
 * @author mteuber, lstuckstette
 */

const express = require('express');
const router = express.Router();


/* GET car by VIN. */
router.get('/', routeMethods.getCarByVin);

/* POST apply cancel transaction. */
router.post('/applyCancelTransaction', routeMethods.applyCancelTransaction);

/* POST cancel transaction. */
router.post('/cancelTransaction', routeMethods.cancelTransaction);

/* POST updateMileage. */
router.post('/mileage', routeMethods.updateMileage);

/* POST preowner. */
router.post('/preowner', routeMethods.updatePreowner);

/* POST stva register. */
router.post('/register', routeMethods.stvaRegister);

/* POST shop entry. */
router.post('/service', routeMethods.shopService);

/* POST tuev entry. */
router.post('/tuev', routeMethods.tuevEntry);

module.exports = router;