import Transaction from "../blockchain/transaction";
import ethNode from "../blockchain/ethNode";
import dbHelper from "../database/dbHelper";
import {toBasicString, getTimestamp, USER_LEVEL, TRANS_HASH_SIZE, TRANSACTION_STATUS} from "../utils";
import {MAILACCOUNT} from "../passwords";
import nodemailer from "nodemailer";

async function updateMileage(req, res) {

    if (req.body.vin == null || req.body.timestamp == null || req.body.mileage == null) {
        console.log("Invalid request on updating mileage: ", req.body);
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp and a mileage value in body"
        });
        return;
    }

    if (!(req.body.authorityLevel === USER_LEVEL.ZWS || req.body.authorityLevel === USER_LEVEL.TUEV ||
        req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
        console.log("User is not authorized to update mileage for car");
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

    const transHash = await ethNode.sendSignedTransaction(transaction, userInfo.privateKey);

    if (transHash == null) {
        console.log("An error occurred while sending transaction: ", transaction);
        res.status(500);
        res.json({
            "message": "Die Transaktion konnte nicht durchgeführt werden!"
        });
        return;
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

    const allTransactions = await ethNode.getAllTransactions(headTxHash);
    console.log("Transactions: ", allTransactions);
    if (allTransactions == null) {
        console.log("Could not find vin in blockchain");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    let annulmentTransactions = [];
    let transactionsWithoutAnnulments = [];
    for (let i=0; i<allTransactions.length; i++){
        if (allTransactions[i].annulmentTarget != null){
            annulmentTransactions.push(allTransactions[i]);
        }
        else {
            transactionsWithoutAnnulments.push(allTransactions[i]);
        }
    }

    for (let i=0; i<transactionsWithoutAnnulments.length; i++){
        transactionsWithoutAnnulments[i].data.state = TRANSACTION_STATUS.VALID;
        for (let j=0; j<annulmentTransactions.length; j++){
            if (transactionsWithoutAnnulments[i].hash === annulmentTransactions[j].data.annulmentTarget){
                transactionsWithoutAnnulments[i].data.state = TRANSACTION_STATUS.INVALID;
                break;
            }
        }
        if (transactionsWithoutAnnulments[i].data.state === TRANSACTION_STATUS.VALID){
            let annulment = await dbHelper.getAnnulment(toBasicString(transactionsWithoutAnnulments[i].hash));
            if (annulment !== null){
                transactionsWithoutAnnulments[i].data.state = TRANSACTION_STATUS.PENDING;
            }
        }
    }

    let transactionPayload = transactionsWithoutAnnulments.map((element) => {
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
            state: element.data.state,
            hash: element.hash
        }
    });

    res.status(200);
    res.json({
        "vin": req.query.vin,
        "payload": transactionPayload
    });
}

async function shopService(req, res) {
    if (req.body.vin == null || req.body.timestamp == null || req.body.mileage == null || req.body.service1 == null ||
        req.body.service2 == null || req.body.oilChange == null) {
        console.log("Invalid request on shop service: ", req.body);
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

    if (req.body.vin == null || req.body.timestamp == null ||
        req.body.mileage == null || req.body.nextCheck == null) {
        console.log("Invalid request on tuev-report: ", req.body);
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp, mileage + nextCheck "
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

    if (req.body.vin == null || req.body.timestamp == null || req.body.mileage == null || req.body.ownerCount == null) {
        console.log("Invalid request on stva-register: ", req.body);
        res.status(400);
        res.json({
            "message": "Request has to include: vin, timestamp, mileage + ownerCount "
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
    if (results === null) {
        res.status(500);
        res.json({
            "message": "Die Annulierungs-Transaktionen konnten nicht geladen werden!"
        });
    }
    else {
        let annulmentPayload = [];
        let annulments = [];

        for (let i = 0; i < results.length; i += 3)
        {
            annulments.push(results.slice(i, i + 3));
        }

        for (let j = 0; j < annulments.length; j++){
            let arr = annulments[j];
            let state = arr[1] === true ? TRANSACTION_STATUS.PENDING : TRANSACTION_STATUS.INVALID;
            let trx = await ethNode.getTransaction(arr[0]);
            let vin = await dbHelper.getVinByPublicKey(trx.to);
            const user = await dbHelper.getUserInfoFromToken(req.get("Authorization").slice("Bearer ".length));
            const userEmail = await dbHelper.getUserByID(arr[2]);
            let body = {
                date: trx.data.timestamp,
                vin: vin[0],
                mileage: trx.data.mileage,
                ownerCount: trx.data.ownerCount,
                entrant: user.email,
                mainInspection: trx.data.mainInspection,
                service1: trx.data.serviceOne,
                service2: trx.data.serviceTwo,
                oilChange: trx.data.oilChange,
                applicant: userEmail[0],
                state: state,
                transactionHash: arr[0]
            };
            annulmentPayload.push(body);
        }

        // from : user publicKey
        // to:  kfz publicKey

        // benötigt werden folgende Attribute:
        // [x] date // Transaktion von wann?
        // [x] vin
        // [x] mileage
        // [x] ownerCount
        // [x] entrant
        // [x] mainInspection
        // [x] service1
        // [x] service2
        // [x] oilChange
        // [x] applicant // wer hat den Antrag erstellt? (aus der DB) -> userID aus annulment_transactions
        // [x] state    "pending"     nicht bearbeitet
        //     "invalid"     angenommen (heißt aus Kompatibilitätsgründen so)
        // [x] transactionHash

        res.json({ "annulments": [
                annulmentPayload,
            //2. annulment,
            // ...
        ]

        });
    }
}

async function insertAnnulmentTransaction(req, res) {

    if (req.body.transactionHash == null || req.body.transactionHash.length < TRANS_HASH_SIZE) {
        console.log("Invalid request for annulment. To create an annulment transaction a transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request for annulment. To create an annulment transaction a transactionHash is required."
        });
        return;
    }
    const hash = req.body.transactionHash;
    const token = req.get("Authorization").slice("Bearer ".length);

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA ||
        req.body.authorityLevel === USER_LEVEL.TUEV || req.body.authorityLevel === USER_LEVEL.ZWS)){
        res.status(401);
        res.json({
            "message": "User is not authorized to create an annulment request"
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

    if (req.body.transactionHash == null || req.body.transactionHash.length < TRANS_HASH_SIZE) {
        console.log("Invalid request to reject an annulment. A transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request to reject an annulment. A transactionHash is required."
        });
        return;
    }
    const hash = req.body.transactionHash;

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)){
        res.status(401);
        res.json({
            "message": "User is not authorized to reject an annulment request"
        });

        return;
    }

    const annulment = await dbHelper.getAnnulment(hash);
    if (annulment == null) {
        console.log("Could not find annulment transaction with hash " + hash);
        res.status(404);
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

    const email = await dbHelper.getUserByID(annulment[4]);
    if (email == null) {
        console.log("Could not find email of request sender " + email);
        res.status(404);
        res.json({
            "message": "E-Mail-Adresse des Antragsstellers konnte nicht gefunden werden: " + email
        });
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD,
        }
    });


    let mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: email,
        subject: 'Annulment request status update - Accepted',
        text: 'Your annulment request for car XX was accepted/rejected.'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            res.status(200);
            res.send({
                "message": "E-Mail mit Ablehnungs-Nachricht wurde versendet."
            });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(400);
            res.send({
                "message": "Ablehnungs-Nachricht konnte nicht gesendet werden."
            });
        }
    });

    res.status(200);
    res.json({
        "message": "Successfully rejected annulment transaction"
    });
}

async function acceptAnnulmentTransaction(req, res) {

    if (req.body.transactionHash == null || req.body.transactionHash.length < TRANS_HASH_SIZE) {
        console.log("Invalid request to accept annulment. A transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request to accept annulment. A transactionHash is required."
        });
        return;
    }
    const hash = req.body.transactionHash;
    const token = req.get("Authorization").slice("Bearer ".length);

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)){
        res.status(401);
        res.json({
            "message": "User is not authorized to accept an annulment request"
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

    const email = await dbHelper.getUserByID(annulment[4]);
    if (email == null) {
        console.log("Could not find email of request sender " + email);
        res.status(404);
        res.json({
            "message": "E-Mail-Adresse des Antragsstellers konnte nicht gefunden werden: " + email
        });
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD,
        }
    });


    let mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: email,
        subject: 'Annulment request status update - Accepted',
        text: 'Your annulment request for car XX was accepted/rejected.'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            res.status(200);
            res.send({
                "message": "E-Mail mit Ablehnungs-Nachricht wurde versendet."
            });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(400);
            res.send({
                "message": "Ablehnungs-Nachricht konnte nicht gesendet werden."
            });
        }
    });

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