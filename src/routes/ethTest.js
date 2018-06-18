import express from "express";
import ethNode from "../blockchain/ethNode";

const router = express.Router();

/* GET home page. */
router.get('/lastBlockNumber', (req, res) => {ethNode.getBlockNumber((err, number) => {
    if (!err){
        console.log("Blocknumber is: ", number);
        res.status(200);
        res.json({"message": "Most Recent Block is", number});
    }
    else {
        res.status(500);
        res.json({"message" : "Error while getting number of last block."});
    }
})});

router.get('/firstBlock', (req, res) => {ethNode.getBlock(1, (err, block) => {
    if (!err){
        console.log("First block is: ", block);
        res.status(200);
        res.json({"message": "First block is ", block });
    }
    else {
        res.status(500);
        res.json({"message" : "Error while getting first block."});
    }
})});

router.get('/lastTransaction', (req, res) => {ethNode.getLastTransactionHash(req.query.publicKeyCar, (err, hash) => {
    if (!err){
        console.log("Hash of last transaction is: ", hash);
        res.status(200);
        res.json({"message": "Hash of the last transaction for the car with the given publlic key is ", hash });
    }
    else {
        res.status(500);
        res.json({"message" : "Error while getting hash of last transaction."});
    }
})});


module.exports = router;
