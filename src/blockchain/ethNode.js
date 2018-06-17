import Web3 from "web3";

let web3;
let isConnected = false;

function connectToNode() {

  const nodeIP = "https://vini-ethnode.westeurope.cloudapp.azure.com:8899";
  web3 = new Web3(nodeIP);

  web3.eth.net.isListening()
    .then(() => {
      console.log("Successfully connected to node running on: ", nodeIP);
      isConnected = true;
    })
    .catch((err) => {
      console.error("Failed to connect to node running on: ", nodeIP, "\n", err);
    });

  //let subscription = web.eth.subscribe(); //might be useful for error handling and such
}

function sendTransaction(transaction, callback) {

  if (!isConnected) {
    console.log("Not connected to node!");
    callback({
      "err": "Not connected to node"
    });
    return;
  }

  web3.eth.net.isListening()
    .then(() => {
      web3.eth.sendTransaction({
        "from": transaction.to,
        "to": transaction.from,
        "gas": 100000,
        "data": web3.utils.toHex(JSON.stringify(transaction.data))
      }, (err, hash) => {
        callback(err)
      });
    })
    .catch((err) => {
      console.error("Error while sending Transaction: ", "\n", err);
    });
}

function getTransaction(transHash, callback) {

    if (!isConnected) {
        console.log("Not connected to node!");
        callback({
            "err": "Not connected to node"
        });
        return;
    }

    web3.eth.net.isListening()
        .then(() => {
            web3.eth.getTransaction(transHash, (err, transaction) => {
                callback(err, transaction)
            });
        })
        .catch((err) => {
            console.error("Error while getting Transaction: ", "\n", err);
        });
}

function getBlock(blockIdentifier, callback) {

    if (!isConnected) {
        console.log("Not connected to node!");
        callback({
            "err": "Not connected to node"
        });
        return;
    }

    web3.eth.net.isListening()
        .then(() => {
            web3.eth.getBlock(blockIdentifier, (err, block) => {
                callback(err, block)
            });
        })
        .catch((err) => {
            console.error("Error while getting Block: ", "\n", err);
        });
}

function getBlockNumber(callback) {

    if (!isConnected) {
        console.log("Not connected to node!");
        callback({
            "err": "Not connected to node"
        });
        return;
    }

    web3.eth.net.isListening()
        .then(() => {
            web3.eth.getBlockNumber((err, number) => {
                callback(err, number)
            });
        })
        .catch((err) => {
            console.error("Error while getting Blocknumber: ", "\n", err);
        });
}

async function getTransactions(publicKeyCar) {
    try {
        let transactions = null;
        let lastTransactionHash = await getLastTransactionHash();
        while (true){
            let currentTransaction = await getTransaction(lastTransactionHash);
            transactions.add = currentTransaction;
            if (currentTransaction.payload.pretransaction != null){
                lastTransactionHash = currentTransaction.payload.pretransaction;
            }
            else {
                return transactions;
            }
        }
    }
    catch(err){
        console.log("Error while getting transactions", err);
    }
}

async function getLastTransactionHash(publicKeyCar) {
    console.log("Public key car: ", publicKeyCar);
    let lastTransactionHash = null;
    let err = null;
    try {
        let latestBlockNumber = await getBlockNumber();
        let block = await getBlock(latestBlockNumber);
        console.log("First Block: ",block);
        while (lastTransactionHash == null) {
            if (block.transactions.length !== 0) {
                block.transactions.forEach(function (transaction) {
                    if (lastTransactionHash == null && transaction.to === publicKeyCar) {
                        lastTransactionHash = transaction.payload.pretransaction;
                    }
                })
            }
            if (latestBlockNumber !== 1) {
                latestBlockNumber = latestBlockNumber - 1;
                block = await getBlock(latestBlockNumber);
            }
            else break;
        }
    }
    catch(e){
        err = e;
        console.log("Error while getting last transaction hash", err);
    }
    return callback(err, lastTransactionHash);
}

function createUserAccount() {

  if (!isConnected) {
    console.log("Not connected to node!");
    return;
  }

  const userObj = web3.eth.accounts.create();

  return {
    "privateKey": userObj.privateKey,
    "publicKey": userObj.address
  };
}

function createCarAccount() {

  if (!isConnected) {
    console.log("Not connected to node!");
    return;
  }

  const carObj = web3.eth.accounts.create();

  return carObj.address;
}


module.exports = {
  "connectToNode": connectToNode,
    "createUserAccount": createUserAccount,
    "createCarAccount": createCarAccount,
    "sendTransaction": sendTransaction,
    "getBlockNumber" : getBlockNumber,
    "getTransaction" : getTransaction,
    "getBlock" : getBlock,
    "getTransactions" : getTransactions,
    "getLastTransactionHash" : getLastTransactionHash
};
