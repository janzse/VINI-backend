import Transaction from "../blockchain/transaction";
import ethNode from "../blockchain/ethNode";
import dbHelper from "../database/dbHelper";
import {getTimestamp, USER_LEVEL, TRANS_HASH_SIZE} from "../utils";

async function updateMileage(req, res) {

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null || req.body.mileage == null) {
        console.log("Invalid request on updating mileage: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp and a mileage value in body and bearer_token in header.Authorization"
        });
        return;
    }

    if (!(req.body.authorityLevel === USER_LEVEL.ZWS || req.body.authorityLevel === USER_LEVEL.TUEV || req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
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
    if (preTransaction == null || preTransaction === 0) {
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }

    const transaction = new Transaction(userInfo.publicKey, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);

    const transHash = await ethNode.sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
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

async function getCarByVin(req, res) {

    if (req.query.vin == null) {
        console.log("Invalid request on getCarByVin");
        res.status(400);
        res.json({
            "message": "invalid/no vin supplied."
        });
        return false;
    }

    let carAddress = await dbHelper.getCarAddressFromVin(req.query.vin);
    if (carAddress === null) {
        console.log("vin not found! aborting.");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    let headTxHash = await dbHelper.getHeadTransactionHash(carAddress);
    if (headTxHash === null) {
        console.log("Head transaction hash not found! aborting.");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    const transactions = await ethNode.getAllTransactions(headTxHash);
    if (transactions == null) {
        console.log("Could not find vin in blockchain");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    let transactionPayload = transactions.map((element) => {
        return {
            timestamp: element.data.timestamp,
            mileage: element.data.mileage,
            service1: element.data.serviceOne,
            service2: element.data.serviceTwo,
            oilChange: element.data.oilChange,
            mainInspection: element.data.mainInspection,
            nextCheck: element.data.nextCheck,
            ownerCount: element.data.preOwner,
            entrant: element.data.email,
            state: element.data.state
        }
    });

    res.status(200);
    res.json({
        "vin": req.query.vin,
        "payload": transactionPayload
    });
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

    if (req.body.authorityLevel !== USER_LEVEL.ZWS) {
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
    if (preTransaction == null || preTransaction.length === 0) {
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }

    const transaction = new Transaction(userInfo.publicKey, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setServiceOne(req.body.service1);
    transaction.setServiceTwo(req.body.service2);
    transaction.setOilChange(req.body.oilChange);

    const transHash = await ethNode.sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Entering shop-service failed"
        });
    }

    res.status(200);
    res.json({
        "message": "Transaktion erfolgreich durchgeführt!"
    });
}

async function tuevEntry(req, res) {
    const token = req.get("Authorization").slice("Bearer ".length);

    if (req.body.vin == null || token == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.nextCheck == null) {
        console.log("Invalid request on tuev-report: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + nextCheck "
        });
        return;
    }

    if (req.body.authorityLevel !== USER_LEVEL.TUEV) {
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

    if (preTransaction == null || preTransaction.length === 0) {
        console.log("Error while getting preTransaction from DB");
        res.status(500);
        res.json({
            "message": "Error while getting preTransaction from DB"
        });
        return;
    }

    const transaction = new Transaction(userInfo.publicKey, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setMainInspection(true);
    transaction.setNextCheck(req.body.nextCheck);

    const transHash = await ethNode.sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
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

async function stvaRegister(req, res) {

    if (req.body.vin == null || req.get("Authorization") == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.ownerCount == null) {
        console.log("Invalid request on stva-register: ", req.body, req.get("Authorization"));
        res.status(400);
        res.json({
            "message": "Request has to include: vin, bearer_token, timestamp, mileage + ownerCount "
        });
        return;
    }

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)){
        console.log("User is not authorized to update registration data for car");
        res.status(401);
        res.json({
            "message": "User is not authorized to update registration data for car"
        });

        return;
    }

    let carAddress = await dbHelper.getCarAddressFromVin(req.body.vin);
    let preTransaction = null;
    if (carAddress == null) {
        console.log("carAddress not found: Creating new one");
        // VIN not in DB yet -> Create it
        const carAccount = ethNode.createCarAccount();
        carAddress = carAccount.publicKey;

        const result = await dbHelper.registerCarInDB(req.body.vin, carAccount.privateKey, carAccount.publicKey, req.body.timestamp);

        if (result == null) {
            console.log("Error while registering new car");
            res.status(500);
            res.json({
                "message": "Die Transaktion konnte nicht durchgeführt werden!"
            });
            return;
        }
    } else { //car already exists, update
        preTransaction = await dbHelper.getHeadTransactionHash(carAddress);
        if (preTransaction == null || preTransaction.length === 0) {
            console.log("Error while getting preTransaction from DB");
            res.status(500);
            res.json({
                "message": "Error while getting preTransaction from DB"
            });
            return;
        }
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

    const transaction = new Transaction(userInfo.publicKey, userInfo.email, req.body.vin, preTransaction, carAddress, req.body.timestamp);
    transaction.setMileage(req.body.mileage);
    transaction.setPreOwner(req.body.ownerCount);

    const transHash = await ethNode.sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
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

async function getAllAnnulmentTransactions(req, res) {

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)){
        console.log("User is not authorized to retrieve annulment transactions");
        res.status(401);
        res.json({
            "message": "User is not authorized to retrieve annulment transactions"
        });

        return;
    }

    const results = await dbHelper.getAllAnnulmentTransactions();
    if (results == null) {
        res.status(500);
        res.json({
            "message": "Die Annulierungs-Transaktionen konnten nicht geladen werden!"
        });
    }
    else {
        let annulmentPayload = [];

        let web3utils = require('web3-utils');
        let trx = await ethNode.getTransaction('0xf542d12f7b7987b79f844c097dc76fc9a59763699a4466de407b500b93fc6f15');
        let trxInput = web3utils.toAscii(trx.input).replace(/"/g, "'");

        results.forEach(element => {
            annulmentPayload.push(element);
        });
        annulmentPayload.push(trxInput);
        //res.send({"annulments": annulmentPayload});
        //res.send(JSON.stringify({"annulments": annulmentPayload}));

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
        console.log(results);
        const annulment = {
            transactionHash: results[0],
            pending: results[1],
            user_id: results[2],
            vin: results[3]
        };

        // benötigt werden folgende Attribute:
        // date // Transaktion von wann?
        // vin
        // mileage
        // ownerCount
        // entrant
        // mainInspection
        // service1
        // service2
        // oilChange
        // applicant // wer hat den Antrag erstellt? (aus der DB)
        // state    "pending"     nicht bearbeitet
        //          "invalid"     angenommen (heißt aus Kompatibilitätsgründen so)
        // transactionHash

        res.json({ "annulments": [
            annulment,
            //2. annulment,
            // ...
        ]

        });
    }
}

async function insertAnnulmentTransaction(req, res) {

    const hash = req.body.transactionHash;
    const token = req.get("Authorization").slice("Bearer ".length);

    if (hash == null || hash.length < TRANS_HASH_SIZE || token == null) {
        console.log("Invalid request for annulment. To create an annulment transaction a transactionHash and a userId is required.");
        res.status(400);
        res.json({
            "message": "Invalid request for annulment. To create an annulment transaction a transactionHash and a userId is required."
        });
        return;
    }

    const creator = await dbHelper.getUserInfoFromToken(token);

    if (creator == null || creator.length === 0) {
        console.log("Could not get creator from bearer token:", token);
        res.status(500);
        res.json({
            "message": "Could not get creator from bearer token: " + token
        });
        return;
    }

    const annulment = await dbHelper.getAnnulment(hash);

    if (annulment != null) {
        console.log("Annulment transaction already exists.");
        res.status(409);
        res.json({
            "message": "Annulment transaction already exists."
        });
        return;
    }

    const transaction = await ethNode.getTransaction(hash);

    if (transaction == null) {
        console.log("No transaction found with hash:", hash);
        res.status(400);
        res.json({
            "message": "No transaction found with hash: " + hash
        });
        return;
    }

    const insertResult = await dbHelper.insertAnnulment(hash, creator.id);

    if (insertResult == null) {
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

async function rejectAnnulmentTransaction(req, res) {

    const hash = req.body.transactionHash;

    if (hash == null || hash.length < TRANS_HASH_SIZE) {
        console.log("Invalid request to reject an annulment. A transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request to reject an annulment. A transactionHash is required."
        });
        return;
    }

    const annulment = await dbHelper.getAnnulment(hash);

    if (annulment == null) {
        console.log("Could not find annulment transaction with hash " + hash);
        res.status(400);
        res.json({
            "message": "Could not find annulment transaction with hash " + hash
        });
        return;
    }

    const deletion = await dbHelper.rejectAnnulment(hash);

    if (deletion == null) {
        console.log("Error while deleting annulment transaction from DB.");
        res.status(500);
        res.json({
            "message": "Error while deleting annulment transaction from DB."
        });
        return;
    }

    res.status(200);
    res.json({
        "message": "Successfully rejected annulment transaction"
    });
}

async function acceptAnnulmentTransaction(req, res) {

    const hash = req.body.transactionHash;
    const token = req.get("Authorization").slice("Bearer ".length);

    if (hash == null || hash.length < TRANS_HASH_SIZE || token == null) {
        console.log("Invalid request to reject an annulment. A transactionHash and a userId is required.");
        res.status(400);
        res.json({
            "message": "Invalid request to reject an annulment. A transactionHash and a userId is required."
        });
        return;
    }

    const stvaEmployee = await dbHelper.getUserInfoFromToken(token);

    if (stvaEmployee == null || stvaEmployee.length === 0) {
        console.log("Could not get stvaEmployee from bearer token:", token);
        res.status(500);
        res.json({
            "message": "Could not get stvaEmployee from bearer token: " + token
        });
        return;
    }

    // Get annulmentTransaction from DB annulment_transaction
    const annulment = await dbHelper.getAnnulment(hash);

    if (annulment == null) {
        console.log("Could not find annulment transaction with hash " + hash);
        res.status(400);
        res.json({
            "message": "Could not find annulment transaction with hash " + hash
        });
        return;
    }

    // Get Transaction which should be annulled
    const annulmentTarget = await ethNode.getTransaction(hash);

    if (annulmentTarget == null) {
        console.log("No transaction found with hash:", hash);
        res.status(400);
        res.json({
            "message": "No transaction found with hash: " + hash
        });
        return;
    }

    // Get preTransaction Hash from the publicKey of the car
    const preTransaction = await dbHelper.getHeadTransactionHash(annulmentTarget.to);

    // Get Information about the original creator of the annulment transaction
    const creator = await dbHelper.getUserInfoFromUserId(annulment.userId);

    const transaction = new Transaction(stvaEmployee.publicKey, creator.email, annulmentTarget.data.vin, preTransaction, annulmentTarget.to, getTimestamp());
    transaction.setAnnulmentTarget(annulmentTarget.hash);

    const result = await ethNode.sendSignedTransaction(transaction, stvaEmployee.privateKey);

    if (result == null) {
        console.log("Error while accepting annulmentTransaction.");
        res.status(500);
        res.json({
            "message": "Error while accepting annulmentTransaction."
        });
        return;
    }

    const pendingResult = await dbHelper.acceptAnnulment(annulment.transactionHash);

    if (pendingResult == null) {
        console.log("Error while updating pending annulmentTransaction");
        res.status(500);
        res.json({
            "message": "Error while updating pending annulmentTransaction"
        });
        return;
    }

    res.status(200);
    res.json({
        "message": "Successfully accepted annulmentTransaction"
    });
}


module.exports = {
    "updateMileage": updateMileage,
    "shopService": shopService,
    "tuevEntry": tuevEntry,
    "stvaRegister": stvaRegister,
    "getCarByVin": getCarByVin,
    "getAllAnnulmentTransactions": getAllAnnulmentTransactions,
    "insertAnnulmentTransaction": insertAnnulmentTransaction,
    "rejectAnnulmentTransaction": rejectAnnulmentTransaction,
    "acceptAnnulmentTransaction": acceptAnnulmentTransaction
};