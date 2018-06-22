import express from "express";
import ethNode from "../blockchain/ethNode";

const router = express.Router();

//TODO: Kann ich weg?

/* GET home page. */
router.get('/allTransactions', (req, res) => {ethNode.getAllTransactions(req.query.vin, (err, transactions) => {
    if (!err){
        console.log("Transactions are: ", transactions);
        res.status(200);
        res.json({"message": "Transactions are:", transactions});
    }
    else {
        res.status(500);
        res.json({"message" : "Error while getting all transactions for."});
    }
})});


module.exports = router;
