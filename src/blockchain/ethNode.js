const Web3 = require("web3");

export class EthNode {

  userAccounts = [];

  constructor(){

  }

  sendTransaction(trans){

    return true;
  }

  getTransaction(transHash){

    return new Transaction();
  }

  getCarTransaction(transHash){

    return new Transaction();
  }

  createUserAccount(){

    return "privateKey";
  }

  createCarAccount(vin){

    return "privateKey";
  }
}

const web3 = new Web3("http://localhost:8501");
web3.eth.isMining().then(function (value) { console.log("Is mining: ", value) });