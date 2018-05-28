const Web3 = require("web3");

const web3 = new Web3("http://localhost:8501");
web3.eth.isMining().then(function (value) { console.log("Is mining: ", value) });