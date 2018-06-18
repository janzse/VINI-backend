import {getCarAddressFromVin, getUserInfoFromToken} from "../database/dbHelper";
import Transaction from "../blockchain/transaction";
import {sendTransaction, getAllTransactions} from "../blockchain/ethNode";
import dbHelper from "../database/dbHelper";

//TODO: Funktionalität für Annulment hinzufügen. Großer Sonderfall!

function updateMileage(req, res) {

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null || req.body.mileage == null) {
        console.log("Invalid request on updating mileage: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp and a mileage value in body and bearer_token in header.Authorization"
        });
        return false;
    }
    getCarAddressFromVin(req.body.vin, (err, carAddress) => {
        if (carAddress === null) {
            console.log("vin not found! aborting.");
            res.status(400);
            res.json({"message": "Unknown vin!"});
            return false;
        }
        getUserInfoFromToken(req.get("Authorization").slice("Bearer ".length), (userKey, email) => {

            const transaction = new Transaction(userKey, carAddress, req.body.timestamp);
            transaction.setMileage(req.body.mileage);
            transaction.setEmail(email);

            sendTransaction(transaction, (err) => {
                if (err) {
                    console.log("An error occurred while sending transaction: ", transaction, ": ", err);
                    res.status(500);
                    res.json({
                        "message": "Updating mileage failed"
                    });
                } else {
                    console.log("Transaction was sent: ", transaction);
                    res.status(200);
                    res.json({
                        "message": "Successfully updated mileage"
                    });
                }
            });
        });
    });
}

const getTimestamp = () => {
    const today = new Date();
    const todayStr = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = today.getDate();
    day = day < 10 ? "0" + day : day;

    let hours = today.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    let minute = today.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    let seconds = today.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return todayStr + "-" + month + "-" + day + "T" + hours + ":" + minute + ":" + seconds;
};

function getCarByVin(req, res) {
    if (req.query.vin === "dummy") {
        let transactionPayload = [];

        // TODO es ist wichtig, dass das Timestamp Format eingehalten wird (einstellige Zahlen
        // mit einer 0 auffüllen)
        let payloadItem1 = {
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
        let payloadItem2 = {
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
        let payloadItem3 = {
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
        let payloadItem4 = {
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


        let jsonResponse = {
            "vin": req.query.vin,
            transactionPayload
        };

        res.send(JSON.stringify(jsonResponse));
    } else {

        if (req.query.vin == null) {
            console.log("Invalid request on getCarByVin");
            res.status(400);
            res.json({
                "message": "invalid/no vin supplied."
            });
            return false;
        }
        getCarAddressFromVin(req.query.vin, (err, carAddress) => {
            if (carAddress === undefined) {
                console.log("vin not found in DB!! aborting.");
                res.status(400);
                res.json({"message": "Unknown vin!"});
                return false;
            }
            let transactions = getAllTransactions(carAddress).then((result) => {
                let transactionPayload = [];
                transactions.array.forEach(element => {
                    let payloadItem = {
                        timestamp: element.data.timestamp,
                        mileage: element.data.mileage,
                        service1: element.data.serviceOne,
                        service2: element.data.serviceTwo,
                        oilchange: element.data.oilChange,
                        nextcheck: element.data.inspection,
                        ownerCount: element.data.preOwner,
                        entrant: element.data.entrant,
                        state: element.data.state
                    };
                    transactionPayload.push(payloadItem);
                });
                let jsonResponse = {
                    vin: req.query.vin,
                    transactionPayload
                };
                res.send(JSON.stringify(jsonResponse));
            }, (error) => {
            });
            // if (transactions === undefined) {
            //     console.log("vin not found in Blockchain! aborting.");
            //     res.status(400);
            //     res.json({"message": "Unknown vin!"});
            //     return false;
            // }


        });
    }


}

function cancelTransaction(req, res) {
    console.log(req.body);
    res.send(req.body);    // echo the result back
}

function applyCancelTransaction(req, res) {
    console.log(req.body);
    res.send(req.body);    // echo the result back
}

function shopService(req, res) {
    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.service1 == null || req.body.service2 == null ||
        req.body.oilChange == null) {
        console.log("Invalid request on shop service: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage, service1," +
            " service2 + oilchange"
        });
        return false;
    }
    getCarAddressFromVin(req.body.vin, (err, carAddress) => {
        if (carAddress === null) {
            console.log("vin not found! aborting.");
            res.status(400);
            res.json({"message": "Unknown vin!"});
            return false;
        }
        getUserInfoFromToken(req.get("Authorization").slice("Bearer ".length), (userKey, email) => {

            const transaction = new Transaction(userKey, carAddress, req.body.timestamp);
            transaction.setMileage(req.body.mileage);
            transaction.setServiceOne(req.body.service1);
            transaction.setServiceTwo(req.body.service1);
            transaction.setOilchange(req.body.oilChange);
            transaction.setEmail(email);

            sendTransaction(transaction, (err) => {
                if (err) {
                    console.log("An error occurred while sending transaction: ", transaction, ": ", err);
                    res.status(500);
                    res.json({
                        "message": "Entering shop-service failed"
                    });
                } else {
                    console.log("Transaction was sent: ", transaction);
                    res.status(200);
                    res.json({
                        "message": "Successfully entered shop-service"
                    });
                }
            });
        });
    });
}

function tuevEntry(req, res) {
    console.log(req.body);

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.nextCheck == null) {
        console.log("Invalid request on tuev-report: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + nextCheck "
        });
        return false;
    }

    getCarAddressFromVin(req.body.vin, (err, carAddress) => {
        if (carAddress === null) {
            console.log("vin not found! aborting.");
            res.status(400);
            res.json({"message": "Unknown vin!"});
            return false;
        }
        getUserInfoFromToken(req.get("Authorization").slice("Bearer ".length), (userKey, email) => {

            const transaction = new Transaction(userKey, carAddress, req.body.timestamp);
            transaction.setMileage(req.body.mileage);
            transaction.setNextCheck(req.body.nextCheck);
            transaction.setEmail(email);

            sendTransaction(transaction, (err) => {
                if (err) {
                    console.log("An error occurred while sending transaction: ", transaction, ": ", err);
                    res.status(500);
                    res.json({
                        "message": "Entering tuev-report failed"
                    });
                } else {
                    console.log("Transaction was sent: ", transaction);
                    res.status(200);
                    res.json({
                        "message": "Successfully entered tuev-report"
                    });
                }
            });
        });
    });
}

function stvaRegister(req, res) {
    console.log(req.body);

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.ownerCount == null) {
        console.log("Invalid request on stva-register: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + ownerCount "
        });
        return false;
    }

    getCarAddressFromVin(req.body.vin, (err, carAddress) => {
        if (carAddress === null) {
            console.log("vin not found! aborting.");
            res.status(400);
            res.json({"message": "Unknown vin!"});
            return false;
        }
        getUserInfoFromToken(req.get("Authorization").slice("Bearer ".length), (userKey, email) => {

            const transaction = new Transaction(userKey, carAddress, req.body.timestamp);
            transaction.setMileage(req.body.mileage);
            transaction.setpreOwner(req.body.ownerCount);
            transaction.setEmail(email);

            sendTransaction(transaction, (err) => {
                if (err) {
                    console.log("An error occurred while sending transaction: ", transaction, ": ", err);
                    res.status(500);
                    res.json({
                        "message": "Entering stva-register failed"
                    });
                } else {
                    console.log("Transaction was sent: ", transaction);
                    res.status(200);
                    res.json({
                        "message": "Successfully entered stva-register"
                    });
                }
            });
        });
    });
}

function getAllAnnulmentTransactions(req, res) {
    dbHelper.getAnnulmentTransactionsFromDB((error, results) => {
        if (error) {
            res.status(500);
            res.json({
                "message": "Failure at getting annulment transactions"
            });
        }
        else {
            let annulmentPayload = [];
            results.forEach(element => {
                let payloadItem = {
                    transactionHash: element[0].transactionHash[0],
                    rejected: element[1].rejected[0],
                    user_id: element[2].user_id[0]
                };
                annulmentPayload.push(payloadItem);
            });
            res.send(JSON.stringify({"annulments": annulmentPayload}));
            //next();
        }
    });
}

module.exports = {
    "updateMileage": updateMileage,
    "cancelTransaction": cancelTransaction,
    "applyCancelTransaction": applyCancelTransaction,
    "shopService": shopService,
    "tuevEntry": tuevEntry,
    "stvaRegister": stvaRegister,
    "getCarByVin": getCarByVin,
    "getAllAnnulmentTransactions": getAllAnnulmentTransactions
};