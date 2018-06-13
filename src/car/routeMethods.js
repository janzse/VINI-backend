import {getCarAddressFromVin, getUserInfoFromToken} from "../database/dbHelper";
import Transaction from "../blockchain/transaction";
import {sendTransaction} from "../blockchain/ethNode";

//TODO: Funktionalität für Annulment hinzufügen. Großer Sonderfall!

function updateMileage(req, res) {

  if (req.body.vin == null || req.body.bearer_token == null || req.body.timestamp == null || req.body.mileage == null) {
    console.log("Invalid request on updating mileage: ", req.body);
    res.status(400);
    res.json({
      "message": "Request has to include: vin, bearer_token, timestamp and a mileage value"
    });
  }

  getCarAddressFromVin(req.body.vin, (carAddress) => {
    getUserInfoFromToken(req.body.bearer_token, (userKey, email) => {

      const transaction = new Transaction(userKey, carAddress, req.body.timestamp);
      transaction.setMileage(req.body.mileage);
      transaction.setEmail(email);

      sendTransaction(transaction, (err) => {
        if (err) {
          console.log("An error occurred while sending transaction: ", transaction, ": ", err);
          res.status(500);
          res.json({
            "message": "Updating mileage failed"
          });
        } else {
          res.status(200);
          res.json({
            "message": "Successfully updated mileage"
          });
        }
      });
    });
  });
}


module.exports = {
  "updateMileage": updateMileage
};
