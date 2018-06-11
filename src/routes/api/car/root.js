/**
 *
 * @author mteuber
 */

const express = require('express');
const router = express.Router();

/* GET car by VIN. */
router.get('/', function(req, res, next) {
    var transactionPayload = [];
    
        var payloadItem1 = {
            timestamp: 1,
            mileage: 2,
            service1: 3,
            service2: 4,
            oilchange: 5,
            nextcheck: 6,
            ownerCount: 7
        };
        var payloadItem2 = {
            timestamp: 8,
            mileage: 9,
            service1: 10,
            service2: 11,
            oilchange: 12,
            nextcheck: 13,
            ownerCount: 14
        };

        transactionPayload.push(payloadItem1);
        transactionPayload.push(payloadItem2);
        var jsonResponse = {
            vin: req.params.vin,
            transactionPayload
        };
    
        res.send(JSON.stringify(jsonResponse));
        return;
});

module.exports = router;