import Web3 from "web3";
import {toHexString, toBasicString} from "../utils"
import dbHelper from "../database/dbHelper";
import Transaction from "./transaction";

const nodeIP = "http://137.117.247.14:3311";
const web3 = new Web3(nodeIP);

async function isConnected() {
    try {
        return await web3.eth.net.isListening();
    }
    catch (err) {
        console.log("Error while checking connection status to node: \n", err);
        return false;
    }
}

function sendTransaction(transaction) {
    return new Promise(async (resolve) => {
        const connected = await isConnected();

        if (connected) {
            web3.eth.sendTransaction(transaction)
                .once("transactionHash", (hash) => {
                    console.log("Sending transaction successful:", hash);
                    resolve(toBasicString(hash));
                })
                .catch((err) => {
                    console.log("Error while sending Transaction\n", err);
                    resolve(null);
                });
        } else {
            resolve(null);
        }
    });
}

async function sendSignedTransaction(transaction, privateKey) {
    return new Promise(async (resolve) => {
        const connected = await isConnected();

        if (connected) {
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
                })
                .catch((err) => {
                    console.log("Error while sending signed Transaction\n", err);
                    resolve(null);
                });
        } else {
            resolve(null);
        }
    });
}

async function getTransaction(transHash) {
    try {
        const connected = await isConnected();

        if (connected) {
            const rawTransaction = await web3.eth.getTransaction(toHexString(transHash));

            const transaction = new Transaction(rawTransaction.from, null, null, null, rawTransaction.to, null);
            transaction.setHash(rawTransaction.hash);
            transaction.data = JSON.parse(web3.utils.toAscii(rawTransaction.input));

            return transaction;
        }
        return null;
    }
    catch (err) {
        console.error("Error while getting Transaction: ", "\n", err);
        return null;
    }

}

async function getAllTransactions(headTxHash) {
    let transactions = [];

    let currentHash = headTxHash;

    try {
        let currentTransaction = await getTransaction(currentHash);
        transactions.push(currentTransaction);
        while (currentTransaction.data.preTransaction !== null) {
            currentHash = currentTransaction.data.preTransaction;
            currentTransaction = await getTransaction(currentHash);
            transactions.push(currentTransaction);
        }
    }
    catch (err) {
        console.log("Error while getting all transactions", err);
        return null;
    }
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

    const result = sendTransaction(transaction);

    if (result == null) {
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
    "nodeIP": nodeIP,
    "isConnected": isConnected,
    "createUserAccount": createUserAccount,
    "createCarAccount": createCarAccount,
    "sendTransaction": sendTransaction,
    "sendSignedTransaction": sendSignedTransaction,
    "getTransaction": getTransaction,
    "getAllTransactions": getAllTransactions
};
