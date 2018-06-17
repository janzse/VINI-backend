import express from "express";
import ethNode from "../blockchain/ethNode";

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {ethNode.getBlockNumber((err, number) => {
    if (!err){
        console.log("Blocknumber is: ", number);
        res.status(200);
        res.json({"message": "Most Recent Block is", number});
    }
})});

//router.get('/async', (req, res) => {ethNode.getBlocks((err, block)) => {}})

module.exports = router;
