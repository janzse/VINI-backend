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

function getBlock(blockNumber, callback) {

    if (!isConnected) {
        console.log("Not connected to node!");
        callback({
            "err": "Not connected to node"
        });
        return;
    }

    web3.eth.net.isListening()
        .then(() => {
            web3.eth.getBlock(transHash, (err, block) => {
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

async function getBlocks(publicKeyCar) {
    try {
        block = await getBlock("latest");
        if (block.transactions.length === 0){
            if (block.parentHash != null) {
                nextBlockHash = block.parentHash;
            }
            else {
                return false;
            }
        }
        else {
            transactions.forEach(function (transaction) {
                if (transaction.to === publicKeyCar) {
                    transactions.add(t);
                    if (transaction.payload.pretransaction != null) {
                        nextTransactionHash = transaction.payload.pretransaction;
                    }
                    else {
                        nextTransactionHash = null;
                    }
                }
            })
        }
        while (nextBlockHash != null){

        }
    }
    catch(err){
        console.log("Error while getting latest block", err);
    }
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
    "getBlocks" : getBlocks
};
