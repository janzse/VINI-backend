import Web3 from "web3";
import {toHexString, toBasicString} from "../utils"
import dbHelper from "../database/dbHelper";
import Transaction from "./transaction";

let web3;
let isConnected = false;

function connectToNode() {

    const nodeIP = "http://137.117.247.14:3311";
    web3 = new Web3(nodeIP);

    web3.eth.net.isListening()
        .then(() => {
            console.log("Successfully connected to node running on: ", nodeIP);
            isConnected = true;
        })
        .catch((err) => {
            console.error("Failed to connect to node running on: ", nodeIP, "\n", err);
        });
}

function sendTransaction(transaction) {

    return new Promise(async (resolve) => {
        try {
            await web3.eth.net.isListening();

            web3.eth.sendTransaction(transaction)
                .once("transactionHash", (hash) => {
                    console.log("Sending transaction successful:", hash);
                    resolve(hash);
                });
        } catch (err) {
            console.log("Error while sending transaction: ", err);
            resolve(null);
        }
    });
}

async function sendSignedTransaction(transaction, privateKey) {
    return new Promise(async (resolve) => {
        try {
            await web3.eth.net.isListening();

            transaction.data = web3.utils.toHex(JSON.stringify(transaction.data));

            privateKey = toHexString(privateKey);
            const singedTX = await web3.eth.accounts.signTransaction(transaction, privateKey);

            web3.eth.sendSignedTransaction(singedTX.rawTransaction)
                .once('transactionHash', async (hash) => {
                    console.log("Sending signedTransaction successful:", hash);

                    const result = await dbHelper.updateHeadTransactionHash(transaction.to, hash);

                    if (result == null) {
                        console.log("Transaction not saved to database.");
                    }

                    resolve(toBasicString(hash));
                });
        }
        catch (err) {
            console.log("Error while sending signedTransaction: ", err);
            resolve(null);
        }
    });
}

async function getTransaction(transHash) {
    try {
        await web3.eth.net.isListening();
        return await web3.eth.getTransaction(toHexString(transHash));
    }
    catch (err) {
        console.error("Error while getting Transaction: ", "\n", err);
        return null;
    }
}

//TODO: Testing on real blockchain transactions
async function getAllTransactions(headTxHash) {
    let transactions = [];
    /*
    let currentHash = headTxHash;

    try {
        let currentTransaction = await getTransaction(lastTransactionHash);
        while (currentTransaction.payload.pretransaction !== null) {
            currentHash = currentTransaction.payload.pretransaction;
            currentTransaction = await getTransaction(currentHash);
            transactions.add = currentTransaction;
        }
    }
    catch (err) {
        console.log("Error while getting transactions", err);
        return null;
    }*/
    return transactions;
}

async function createUserAccount() {

    if (!isConnected) {
        console.log("Not connected to node!");
        return;
    }

    const userAccount = web3.eth.accounts.create();

    const acc = await web3.eth.getAccounts();

    const transaction = {
        "from": acc[0],
        "to": userAccount.address,
        "gas": 100000,
        "value": 500000000000
    };

    console.log("Trasnaction: ", transaction);

    const result = sendTransaction(transaction);

    if(result == null){
        console.log("Could not pre-fund new userAccount");
        return null;
    }

    return {
        "privateKey": toBasicString(userAccount.privateKey),
        "publicKey": toBasicString(userAccount.address)
    };
}

function createCarAccount() {

    if (!isConnected) {
        console.log("Not connected to node!");
        return;
    }

    const carAccount = web3.eth.accounts.create();

    return {
        "privateKey": toBasicString(carAccount.privateKey),
        "publicKey": toBasicString(carAccount.address)
    }
}


module.exports = {
    "connectToNode": connectToNode,
    "createUserAccount": createUserAccount,
    "createCarAccount": createCarAccount,
    "sendTransaction": sendTransaction,
    "sendSignedTransaction": sendSignedTransaction,
    "getTransaction": getTransaction,
    "getAllTransactions": getAllTransactions
};
