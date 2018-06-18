import Web3 from "web3";

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

async function getTransaction(transHash) {
    try {
        await web3.eth.net.isListening();
        return await web3.eth.getTransaction(transHash);
    }
    catch(err) {
        console.error("Error while getting Transaction: ", "\n", err);
    }
}

async function getBlock(blockIdentifier) {
    try {
        await web3.eth.net.isListening();
        return await web3.eth.getBlock(blockIdentifier);
    }
    catch(err) {
        console.error("Error while getting Block: ", "\n", err);
    }
}

async function getBlockTransactionCount(blockNumber) {
    try {
        await web3.eth.net.isListening();
        return await web3.eth.getBlockTransactionCount(blockNumber);
    }
    catch(err) {
        console.error("Error while getting TransactionCount: ", "\n", err);
    }
}

async function getBlockNumber() {
    try {
        await web3.eth.net.isListening();
        return await web3.eth.getBlockNumber();
    }
    catch(err) {
                console.error("Error while getting Blocknumber: ", "\n", err);
    }
}

async function getTransactionCountFirst1000Blocks() {
    let response = [];
    console.log("Response empty: ", response.length);
    let callback = function(err, res) {
        if (!err) {
            console.log("Callback response: ", res);
            response.push(res);
        }
        else {
            console.log("Error ins batch processing callback.")
        }

    };
    try {
        await web3.eth.net.isListening();
        let currentBlockNumber = await web3.eth.getBlockNumber();
        let batchRequest = new web3.eth.BatchRequest();
        for (let i = currentBlockNumber; i >= currentBlockNumber-1000; i--){
            batchRequest.add(web3.eth.getBlockTransactionCount.request(i, callback));
        }
        batchRequest.execute();
        console.log("Response: ", response);
    }
    catch(err) {
        console.error("Error while getting Transactions for first 1000 Blocks: ", "\n", err);
    }
}

async function getAllTransactions(publicKeyCar) {
    try {
        let transactions = [];
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

async function getLastTransactionHash(publicKeyCar, callback) {
    let lastTransactionHash = null;
    let err = false;
    try {
        let lastBlockNumber = await getBlockNumber();
        console.log("Latest block number: ", lastBlockNumber);
        //let block = await getBlock(latestBlockNumber);
        let transactionCount = await getBlockTransactionCount(lastBlockNumber);
        //console.log("First Block: ",block);
        let start = new Date().getTime();
        for (let i = 1 ; i <= 100; i++){
            let blockNumber = lastBlockNumber;
            while (blockNumber >= 1) {
                console.log("Blocknummer: ", blockNumber);
                console.log("Block transaction length: ", transactionCount);
                blockNumber = blockNumber - 1;
                transactionCount = await getBlockTransactionCount(blockNumber);
                if (transactionCount > 0){
                    console.log("JUHUUU Transaktionen!! ---------------------------------------")
                }
                /*if (block.transactions.length !== 0) {
                    block.transactions.reverse().forEach(function (transaction) {
                        console.log("Transaction: ", transaction);
                        if (lastTransactionHash == null && transaction.to === publicKeyCar) {
                            lastTransactionHash = transaction.payload.pretransaction;
                        }
                    })
                }
                if (blockNumber !== 1) {
                    latestBlockNumber = blockNumber - 1;
                    block = await getBlock(blockNumber);
                }
                else break;*/

        }}
        let stop = new Date().getTime();
        console("Laufzeit: ", (start - stop), " s")
    }
    catch(e){
        err = true;
        console.log("Error while getting last transaction hash", e);
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
    "getAllTransactions" : getAllTransactions,
    "getLastTransactionHash" : getLastTransactionHash
};
