import Transaction from "../blockchain/transaction";
import ethNode from "../blockchain/ethNode";
import dbHelper from "../database/dbHelper";
import {toBasicString, getTimestamp, USER_LEVEL, TRANS_HASH_SIZE, TRANSACTION_STATUS, validMileage} from "../utils";
import {MAILACCOUNT} from "../passwords";
import nodemailer from "nodemailer";
import moment from "moment";

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

    if (!validMileage(req.body.mileage)) {
        console.log("Mileage not a valid number.");
        res.status(400);
        res.json({"message": "Ungültiger Kilometerstand!"});
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
    if (allTransactions == null) {
        console.log("Could not find vin in blockchain");
        res.status(400);
        res.json({"message": "Fahrzeug nicht gefunden!"});
        return;
    }

    let annulmentTransactions = [];
    let transactionsWithoutAnnulments = [];
    for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].data.annulmentTarget != null) {
            annulmentTransactions.push(allTransactions[i]);
        }
        else {
            transactionsWithoutAnnulments.push(allTransactions[i]);
        }
    }

    for (let i = 0; i < transactionsWithoutAnnulments.length; i++) {
        transactionsWithoutAnnulments[i].data.state = TRANSACTION_STATUS.VALID;
        for (let j = 0; j < annulmentTransactions.length; j++) {
            if (transactionsWithoutAnnulments[i].hash === annulmentTransactions[j].data.annulmentTarget) {
                transactionsWithoutAnnulments[i].data.state = TRANSACTION_STATUS.INVALID;
                break;
            }
        }
        if (transactionsWithoutAnnulments[i].data.state === TRANSACTION_STATUS.VALID) {
            let annulment = await dbHelper.getAnnulment(toBasicString(transactionsWithoutAnnulments[i].hash));
            if (annulment !== null && annulment.pending === true) {
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

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
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

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
        console.log("User is not authorized to retrieve annulment transactions");
        res.status(401);
        res.json({
            "message": "User is not authorized to retrieve annulment transactions"
        });
        return;
    }

    const annulmentsFromDB = await dbHelper.getAllAnnulmentTransactions();
    if (annulmentsFromDB === null) {
        res.status(500);
        res.json({
            "message": "Die Annulierungs-Transaktionen konnten nicht geladen werden!"
        });
        return;
    }

    const combinedTransactions = [];

    for (let i = 0; i < annulmentsFromDB.length; i++) {
        const annulment = annulmentsFromDB[i];
        const ethTx = await ethNode.getTransaction(annulment.transactionHash);

        combinedTransactions.push({
            date: ethTx.data.timestamp,
            vin: ethTx.data.vin,
            mileage: ethTx.data.mileage,
            ownerCount: ethTx.data.ownerCount,
            entrant: annulment.creator,
            mainInspection: ethTx.data.mainInspection,
            service1: ethTx.data.serviceOne,
            service2: ethTx.data.serviceTwo,
            oilChange: ethTx.data.oilChange,
            applicant: annulment.applicant == null ? "" : annulment.applicant,
            state: annulment.pending === true ? TRANSACTION_STATUS.PENDING : TRANSACTION_STATUS.INVALID,
            transactionHash: annulment.transactionHash
        });
    }

    res.status(200);
    res.json({
        "annulments": combinedTransactions
    });
}

async function insertAnnulmentTransaction(req, res) {

    const hash = req.body.transactionHash;

    if (!hash || hash.length < TRANS_HASH_SIZE) {
        console.log("Invalid request for annulment. To create an annulment transaction a transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request for annulment. To create an annulment transaction a transactionHash is required."
        });
        return;
    }

    const token = req.get("Authorization").slice("Bearer ".length);

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA ||
        req.body.authorityLevel === USER_LEVEL.TUEV || req.body.authorityLevel === USER_LEVEL.ZWS)) {
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

    const insertResult = await dbHelper.insertAnnulment(hash, creator.id, transaction.data.vin);

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
        "message": "Annullierung beantragt."
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

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
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

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD
        }
    });


    let mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: annulment.creator,
        subject: 'Ihr Annulierungsantrag vom ' + moment(annulment.creationDate).format("DD.MM.YYYY") +
        ' wurde abgelehnt.',
        text: 'Hallo,' +
        '\n\nder von Ihnen am ' + moment(annulment.creationDate).format("DD.MM.YYYY") + ' gestellte ' +
        'Annulierungs-Antrag für den Scheckheft-Eintrag des Fahrzeugs mit der Fahrgestellnummer ' + annulment.vin +
        ' wurde abgelehnt.' +
        '\n\nDiese E-Mail wurde automatisch erstellt. Bitte antworten Sie nicht auf diese E-Mail.' +
        '\n\nFalls Sie Fragen zu dem Vorgang haben, wenden sie sich bitte an das für Sie zuständige ' +
        'Straßenverkehrsamt.' +
        '\n\nMit freundlichen Grüßen\n\nVINI - Ihr digitales Scheckheft'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(400);
            res.send({
                "message": "Ablehnungs-Nachricht konnte nicht gesendet werden."
            });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200);
            res.send({
                "message": "Annullierung erfolgreich abgelehnt! User wurde via E-Mail benachrichtigt."
            });
        }
    });
}

async function acceptAnnulmentTransaction(req, res) {

    const hash = req.body.transactionHash;

    if (hash == null || hash < TRANS_HASH_SIZE) {
        console.log("Invalid request to accept annulment. A transactionHash is required.");
        res.status(400);
        res.json({
            "message": "Invalid request to accept annulment. A transactionHash is required."
        });
        return;
    }

    const token = req.get("Authorization").slice("Bearer ".length);

    if (!(req.body.authorityLevel === USER_LEVEL.STVA || req.body.authorityLevel === USER_LEVEL.ASTVA)) {
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

    if (preTransaction == null) {
        console.log("Cloud not get preTransaction from: ", annulmentTarget.to);
        res.status(500);
        res.json({
            "message": "Cloud not get preTransaction from: " + annulmentTarget.to
        });
        return;
    }

    const transaction = new Transaction(stvaEmployee.publicKey, annulment.creator, annulmentTarget.data.vin, preTransaction, annulmentTarget.to, getTimestamp());
    transaction.setAnnulmentTarget(annulmentTarget.hash);

    const result = await ethNode.sendSignedTransaction(transaction, stvaEmployee.privateKey);

    if (result == null) {
        console.log("Error while accepting annulmentTransaction.");
        res.status(500);
        res.json({
            "message": "Annullierung konnte nicht durchgeführt werden."
        });
        return;
    }

    const pendingResult = await dbHelper.acceptAnnulment(annulment.transactionHash, stvaEmployee.email);

    if (pendingResult == null) {
        console.log("Error while updating pending annulmentTransaction");
        res.status(500);
        res.json({
            "message": "Annullierung konnte nicht durchgeführt werden."
        });
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: MAILACCOUNT.LOGIN,
            pass: MAILACCOUNT.PASSWORD
        }
    });

    let mailOptions = {
        from: MAILACCOUNT.LOGIN,
        to: annulment.creator,
        subject: 'Ihr Annulierungsantrag vom ' + moment(annulment.creationDate).format("DD.MM.YYYY") +
        ' wurde angenommen.',
        text: 'Hallo,' +
        '\n\nder von Ihnen am ' + moment(annulment.creationDate).format("DD.MM.YYYY") + ' gestellte' +
        'Annulierungs-Antrag für den Scheckheft-Eintrag des Fahrzeugs mit der Fahrgestellnummer ' + annulment.vin +
        ' wurde angenommen.' +
        '\n\nDiese E-Mail wurde automatisch erstellt. Bitte antworten Sie nicht auf diese E-Mail.' +
        '\n\nFalls Sie Fragen zu dem Vorgang haben, wenden sie sich bitte an das für Sie zuständige ' +
        'Straßenverkehrsamt.' +
        '\n\nMit freundlichen Grüßen\n\nVINI - Ihr digitales Scheckheft'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(400);
            res.send({
                "message": "Akzeptierungs-Nachricht konnte nicht gesendet werden."
            });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200);
            res.send({
                "message": "Annullierung durchgeführt. User wurde via E-Mail benachrichtigt."
            });
        }
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