import Transaction from "../blockchain/transaction";
import {sendTransaction, sendSignedTransaction, getTransaction, getAllTransactions, createCarAccount} from "../blockchain/ethNode";
import dbHelper from "../database/dbHelper";
import {getTimestamp} from "../utils";

//TODO: Funktionalität für Annulment hinzufügen. Großer Sonderfall!

async function updateMileage(req, res) {

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null || req.body.mileage == null) {
        console.log("Invalid request on updating mileage: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp and a mileage value in body and bearer_token in header.Authorization"
        });
        return;
    }

    if (!(req.body.authorityLevel === 1 || req.body.authorityLevel === 2 || req.body.authorityLevel === 3 || req.body.authorityLevel === 4)){
        res.status(401);
        res.json({
            "message": "User is not authorized to update mileage for car"
        });

        return;
    }

    let carAddress = await dbHelper.getCarAddressFromVin(req.body.vin);
    if (carAddress === null) {
        console.log("vin not found! aborting.");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    const token = req.get("Authorization").slice("Bearer ".length);
    const userInfo = await dbHelper.getUserInfoFromToken(token);

    if (userInfo == null) {
        console.log("Could not find user for token <" + token + ">");
        res.status(400);
        res.json({
            "message": "Could not find user for token <" + token + ">"
        });
        return;
    }

    let preTransaction = await dbHelper.getHeadTransactionHash(carAddress);

    if(preTransaction == null){
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }
    if(preTransaction.length === 0){
        preTransaction = null;
    }

    const transaction = new Transaction(userInfo.address, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);

    const transHash = await sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Die Transaktion konnte nicht durchgeführt werden!"
        });
    } else {

        const updateResult = await dbHelper.updateCarHeadTx(carAddress, transHash);

        if (updateResult == null) {
            console.log("An error occurred while updating headTx in DB");
            res.status(500);
            res.json({
                "message": "An error occurred while updating headTx in DB"
            });
        }

        res.status(200);
        res.json({
            "message": "Transaktion erfolgreich durchgeführt"
        });
    }
}

async function getCarByVin(req, res) {
    // TODO delete me (when this is working)
    if (req.query.vin === "dummy" || req.query.vin === "W0L000051T2123456") {

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
            nextCheck: getTimestamp(),
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
            nextCheck: getTimestamp(),
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
            nextCheck: getTimestamp(),
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
            nextCheck: getTimestamp(),
            ownerCount: 5,
            entrant: "a@a.de",
            state: "open",
            transactionId: "123459"
        };

        transactionPayload.push(payloadItem1);
        transactionPayload.push(payloadItem2);
        transactionPayload.push(payloadItem3);
        transactionPayload.push(payloadItem4);

        res.json({
            "vin": req.query.vin,
            "payload": transactionPayload
        });
    } else {

        if (req.query.vin == null) {
            console.log("Invalid request on getCarByVin");
            res.status(400);
            res.json({
                "message": "invalid/no vin supplied."
            });
            return false;
        }

        const carAddress = await dbHelper.getCarAddressFromVin(req.query.vin);

        if (carAddress == null) {
            console.log("vin not found in DB!! aborting.");
            res.status(400);
            res.json({"message": "Fahrzeug nicht gefunden!"});
            return;
        }

        const transactions = await getAllTransactions(carAddress);

        if (transactions == null) {
            console.log("Could not find vin in blockchain");
            res.status(400);
            res.json({"message": "Fahrzeug nicht gefunden!"});
            return;
        }

        const transactionPayload = transactions.map((element) => {
            return {
                timestamp: element.data.timestamp,
                mileage: element.data.mileage,
                service1: element.data.serviceOne,
                service2: element.data.serviceTwo,
                oilChange: element.data.oilChange,
                mainInspection: element.data.mainInspection,
                nextCheck: element.data.nextCheck,
                ownerCount: element.data.preOwner,
                entrant: element.data.entrant,
                state: element.data.state
            }
        });

        res.status(200);
        res.json({
            "vin": req.query.vin,
            "payload": transactionPayload
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

async function shopService(req, res) {
    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.service1 == null || req.body.service2 == null ||
        req.body.oilChange == null) {
        console.log("Invalid request on shop service: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage, service1," +
            " service2 + oilchange"
        });
        return;
    }

    if (req.body.authorityLevel !== 1){
        res.status(401);
        res.json({
            "message": "User is not authorized to make service entry for car"
        });

        return;
    }

    const carAddress = await dbHelper.getCarAddressFromVin(req.body.vin);
    if (carAddress === null) {
        console.log("vin not found! aborting.");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    const token = req.get("Authorization").slice("Bearer ".length);
    const userInfo = await dbHelper.getUserInfoFromToken(token);

    if (userInfo == null) {
        console.log("Could not find user for token <" + token + ">");
        res.status(400);
        res.json({
            "message": "Could not find user for token <" + token + ">"
        });
        return;
    }

    let preTransaction = await dbHelper.getHeadTransactionHash(carAddress);

    if(preTransaction == null){
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }
    if(preTransaction.length === 0){
        preTransaction = null;
    }

    const transaction = new Transaction(userInfo.address, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setServiceOne(req.body.service1);
    transaction.setServiceTwo(req.body.service1);
    transaction.setOilChange(req.body.oilChange);

    const transHash = await sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Entering shop-service failed"
        });
    } else {

        const updateResult = await dbHelper.updateCarHeadTx(carAddress, transHash);

        if (updateResult == null) {
            console.log("An error occurred while updating headTx in DB");
            res.status(500);
            res.json({
                "message": "Die Transaktion konnte nicht durchgeführt werden!"
            });
        }
        res.status(200);
        res.json({
            "message": "Transaktion erfolgreich durchgeführt!"
        });
    }
}

async function tuevEntry(req, res) {
    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.nextCheck == null) {
        console.log("Invalid request on tuev-report: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + nextCheck "
        });
        return;
    }

    if (req.body.authorityLevel !== 2){
        res.status(401);
        res.json({
            "message": "User is not authorized to make inspection entry for car"
        });

        return;
    }

    const carAddress = await dbHelper.getCarAddressFromVin(req.body.vin);
    if (carAddress === null) {
        console.log("vin not found! aborting.");
        res.status(400);
        res.json({"message": "Fahrzeug wurde nicht gefunden!"});
        return;
    }

    const token = req.get("Authorization").slice("Bearer ".length);
    const userInfo = await dbHelper.getUserInfoFromToken(token);

    if (userInfo == null) {
        console.log("Could not find user for token <" + token + ">");
        res.status(400);
        res.json({
            "message": "Could not find user for token <" + token + ">"
        });
        return;
    }

    let preTransaction = await dbHelper.getHeadTransactionHash(carAddress);

    if(preTransaction == null){
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }
    if(preTransaction.length === 0){
        preTransaction = null;
    }

    const transaction = new Transaction(userInfo.address, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setNextCheck(req.body.nextCheck);

    const transHash = await sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Die Transaktion konnte nicht durchgeführt werden!"
        });
    } else {

        const updateResult = await dbHelper.updateCarHeadTx(carAddress, transHash);

        if (updateResult == null) {
            console.log("An error occurred while updating headTx in DB");
            res.status(500);
            res.json({
                "message": "Die Transaktion konnte nicht durchgeführt werden!"
            });
        }

        res.status(200);
        res.json({
            "message": "Transaktion erfolgreich durchgeführt"
        });
    }
}

async function stvaRegister(req, res) {
    console.log(req.body);

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.ownerCount == null) {
        console.log("Invalid request on stva-register: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + ownerCount "
        });
        return;
    }

    if (!(req.body.authorityLevel === 3 || req.body.authorityLevel === 4)){
        res.status(401);
        res.json({
            "message": "User is not authorized to update registration data for car"
        });

        return;
    }

    let carAddress = await dbHelper.getCarAddressFromVin(req.body.vin);
    if (carAddress == null) {
        console.log("carAddress not found: Creating new one");
        // VIN not in DB yet -> Create it
        const carAccount = createCarAccount();
        carAddress = carAccount.publicKey;

        const result = await dbHelper.registerCarInDB(req.body.vin, carAccount.privateKey, carAccount.publicKey, getTimestamp());

        if (result == null) {
            console.log("Error while registering new car");
            res.status(500);
            res.json({
                "message": "Die Transaktion konnte nicht durchgeführt werden!"
            });
            return;
        }
    } else { //car already exists, abort!
        console.log("Error while registering new car: car already exists!");
        res.status(400);
        res.json({
            "message": "Error while registering new car: car already exists!"
        });
        return;


    }

    const token = req.get("Authorization").slice("Bearer ".length);
    const userInfo = await dbHelper.getUserInfoFromToken(token);

    if (userInfo == null) {
        console.log("Could not find user for token <" + token + ">");
        res.status(400);
        res.json({
            "message": "Could not find user for token <" + token + ">"
        });
        return;
    }

    let preTransaction = await dbHelper.getHeadTransactionHash(carAddress);

    if(preTransaction == null){
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }
    if(preTransaction.length === 0){
        preTransaction = null;
    }

    const transaction = new Transaction(userInfo.address, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setPreOwner(req.body.ownerCount);

    const transHash = await sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Die Transaktion konnte nicht durchgeführt werden!"
        });
    } else {

        const updateResult = await dbHelper.updateCarHeadTx(carAddress, transHash);

        if (updateResult == null) {
            console.log("An error occurred while updating headTx in DB");
            res.status(500);
            res.json({
                "message": "Die Transaktion konnte nicht durchgeführt werden!"
            });
        }

        res.status(200);
        res.json({
            "message": "Transaktion erfolgreich durchgeführt!"
        });
    }
}

async function getAllAnnulmentTransactions(req, res) {

    if (!(req.body.authorityLevel === 3 || req.body.authorityLevel === 4)){
        res.status(401);
        res.json({
            "message": "User is not authorized to retrieve annulment transactions"
        });

        return;
    }

    const results = await dbHelper.getAnnulmentTransactionsFromDB();
    if (results == null) {
        res.status(500);
        res.json({
            "message": "Die Annulierungs-Transaktionen konnten nicht geladen werden!"
        });
    }
    else {
        /*
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
        */
        const annulment = {
            transactionHash: results[0],
            pending: results[1],
            user_id: results[2],
            vin: results[3]
        };
        res.json({
            "annulment": annulment
        });
    }
}

async function insertAnnulmentTransaction(req, res){

    const hash = req.body.transactionHash;
    const userId =  req.body.userId;

    if(hash == null || hash.length < 64 || req.body.userId == null){
        console.log("Invalid request for annulment. To create an annulment transaction a transactionHash and a userId is required.");
        res.status(400);
        res.json({
            "message": "Invalid request for annulment. To create an annulment transaction a transactionHash and a userId is required."
        });
        return;
    }

    const annulment = await dbHelper.getAnnulment(hash, userId);

    if(annulment.length > 0){
        console.log("Annulment transaction already exists.");
        res.status(409);
        res.json({
           "message": "Annulment transaction already exists."
        });
        return;
    }

    const transaction = await getTransaction(hash);

    if(transaction == null){
        console.log("No transaction found with hash:", hash);
        res.status(400);
        res.json({
            "message": "No transaction found with hash: " + hash
        });
        return;
    }

    const insertResult = await dbHelper.insertAnnulment(hash, userId);

    if(insertResult == null){
        console.log("Could not insert annulment transaction in DB");
        res.status(500);
        res.json({
            "message": "Could not insert annulment transaction in DB"
        });
        return;
    }

    res.status(200);
    res.json({
       "message": "Successfully inserted annulment transaction"
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
    "getAllAnnulmentTransactions": getAllAnnulmentTransactions,
    "insertAnnulmentTransaction": insertAnnulmentTransaction
};