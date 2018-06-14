import routeMethods from "../../car/routeMethods";

/**
 *
 * @author mteuber, lstuckstette
 */

const express = require('express');
const router = express.Router();

const getTimestamp = () => {
    const today = new Date()
    const todayStr = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = today.getDate();
    day = day < 10 ? "0" + day : day

    var hours = today.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    var minute = today.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    var seconds = today.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return todayStr + "-" + month + "-" + day +  "T" + hours + ":" + minute + ":" + seconds;
}

/* GET car by VIN. */
router.get('/', (req, res, next) => {
    console.log(req.body);
    var transactionPayload = [];

    // TODO es ist wichtig, dass das Timestamp Format eingehalten wird (einstellige Zahlen
    // mit einer 0 auffüllen)
    var payloadItem1 = {
        timestamp: getTimestamp(),
        mileage: 1337,
        service1: false,
        service2: true,
        oilChange: false,
        mainInspection: true,
        nextcheck: getTimestamp(),
        ownerCount: 4,
        entrant: "d@d.de",
        state: "valid",
        transactionId: "123456"
    };
    var payloadItem2 = {
        timestamp: getTimestamp(),
        mileage: 1338,
        service1: true,
        service2: true,
        oilChange: false,
        mainInspection: true,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "c@c.de",
        state: "invalid",
        transactionId: "123457"
    };
    var payloadItem3 = {
        timestamp: getTimestamp(),
        mileage: 1339,
        service1: false,
        service2: true,
        oilChange: true,
        mainInspection: false,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "b@b.de",
        state: "rejected",
        transactionId: "123458"
    };
    var payloadItem4 = {
        timestamp: getTimestamp(),
        mileage: 1339,
        service1: false,
        service2: true,
        oilChange: true,
        mainInspection: false,
        nextcheck: getTimestamp(),
        ownerCount: 5,
        entrant: "a@a.de",
        state: "open",
        transactionId: "123459"
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
router.post('/applyCancelTransaction', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/cancelTransaction', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);    // echo the result back
});

/* POST Mileage. */
router.post('/mileage', routeMethods.updateMileage);

/* POST cancel transaction. */
router.post('/register', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/service', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);    // echo the result back
});

/* POST cancel transaction. */
router.post('/tuev', (req, res, next) => {
    console.log(req.body);
    res.send(req.body);    // echo the result back
});

module.exports = router;