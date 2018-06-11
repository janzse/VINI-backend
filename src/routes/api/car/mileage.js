import routeMethods from "../../../car/routeMethods";
const express = require('express');
const router = express.Router();

/* POST Mileage. */
router.post('/', routeMethods.updateMileage);


module.exports = router;
