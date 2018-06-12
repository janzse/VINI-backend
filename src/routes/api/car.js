import routeMethods from "../../car/routeMethods";

/**
 *
 * @author mteuber, lstuckstette
 */

const express = require('express');
const router = express.Router();


var getTimestamp = function () {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minute = date.getMinutes();
    var seconds = date.getSeconds();

    return "" + year + "-" + month + "-" + day + "T"
        + hours + ":" + minute + ":" + seconds;
};

/* GET car by VIN. */
router.get('/', function (req, res, next) {
    var transactionPayload = [];

    var payloadItem1 = {
        timestamp: getTimestamp(),
        mileage: 1337,
        service1: false,
        service2: true,
        oilchange: false,
        nextcheck: getTimestamp(),
        ownerCount: 4,
        entrant: "d@d.de",
        state: "valid"
    };
    var payloadItem2 = {
        timestamp: getTimestamp(),
        mileage: 1338,
        service1: true,
        service2: true,
        oilchange: false,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "c@c.de",
        state: "invalid"
    };
    var payloadItem3 = {
        timestamp: getTimestamp(),
        mileage: 1339,
        service1: false,
        service2: true,
        oilchange: true,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "b@b.de",
        state: "rejected"
    };
    var payloadItem4 = {
        timestamp: getTimestamp(),
        mileage: 1339,
        service1: false,
        service2: true,
        oilchange: true,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "a@a.de",
        state: "open"
    };

    transactionPayload.push(payloadItem1);
    transactionPayload.push(payloadItem2);
    transactionPayload.push(payloadItem3);
    transactionPayload.push(payloadItem4);

    var jsonResponse = {
        vin: req.params.vin,
        transactionPayload
    };

    res.send(JSON.stringify(jsonResponse));
    return;
});

/*
    import EthNode from "../../../blockchain/ethNode";

    var transactions = EthNode.getCarTransactions(req.params.vin);

    var transactionPayload = [];

    transactions.array.forEach(element => {
        var payloadItem = {
            timestamp: element.timestamp,
            mileage: element.payload.mileage,
            service1: element.payload.serviceOne,
            service2: element.payload.serviceTwo,
            oilchange: element.payload.oilChange,
            nextcheck: element.payload.inspection,
            ownerCount: element.payload.preowner,
            entrant: element.payload.entrant,
            state: element.payload.state
        };

        transactionPayload.push(payloadItem);
    });

    var jsonResponse = {
        vin: req.params.vin,
        transactionPayload
    };

    res.send(JSON.stringify(jsonResponse));

*/

/* POST apply cancel transaction. */
router.post('/applyCancelTransaction', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/cancelTransaction', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

/* POST Mileage. */
router.post('/mileage', routeMethods.updateMileage);

/* POST cancel transaction. */
router.post('/register', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/service', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/tuev', function(req, res, next) {
    res.send(req.body);    // echo the result back
});

module.exports = router;