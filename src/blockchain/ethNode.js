import Web3 from "web3";

let web3;

function connectToNode() {

  const nodeIP = "http://51.144.115.147:8545";
  web3 = new Web3(nodeIP);

  web3.eth.net.isListening()
    .then(() => {
      console.log("Successfully connected to node running on: ", nodeIP);
    })
    .catch((err) => {
      console.error("Failed to connect to node running on: ", nodeIP, "\n", err);
    });

  //let subscription = web.eth.subscribe(); //might be useful for error handling and such
}

function sendTransaction(trans) {

  return true;
}

function getTransaction(transHash) {

  return new Transaction();
}

function getCarTransaction(transHash) {

  return new Transaction();
}

function createUserAccount() {

  return "privateKey";
}

function createCarAccount(vin) {


  return "privateKey";
}


module.exports = {
  "connectToNode": connectToNode
};