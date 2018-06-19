import routeMethods from "../../car/routeMethods";
import authRoutesMethods from "../../authorisation/routeMethods";

/**
 *
 * @author mteuber, lstuckstette
 */

const express = require('express');
const router = express.Router();


/* GET car by VIN. */
router.get('/', routeMethods.getCarByVin);

/* GET annulment trxs. */
router.get('/annulment', authRoutesMethods.isAuthorised, routeMethods.getAllAnnulmentTransactions);

/* POST apply cancel transaction. */
router.post('/applyCancelTransaction', authRoutesMethods.isAuthorised, routeMethods.applyCancelTransaction);

/* POST cancel transaction. */
router.post('/cancelTransaction', authRoutesMethods.isAuthorised, routeMethods.cancelTransaction);

/* POST updateMileage. */
router.post('/mileage', authRoutesMethods.isAuthorised, routeMethods.updateMileage);

/* POST stva register. */
router.post('/register', authRoutesMethods.isAuthorised, routeMethods.stvaRegister);

/* POST shop entry. */
router.post('/service', authRoutesMethods.isAuthorised, routeMethods.shopService);

/* POST tuev entry. */
router.post('/tuev', authRoutesMethods.isAuthorised, routeMethods.tuevEntry);

module.exports = router;