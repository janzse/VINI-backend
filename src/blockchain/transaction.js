import {toHexString} from "../utils"

class Transaction {

    constructor(from, email, vin, preTransaction, to, timestamp) {

        this.from = toHexString(from); // String: sender address where the TX originated from (STVAWallet)
        this.to = toHexString(to); // String: recipient address (a carWallet)
        this.gas = 100000; // Default gas
        this.data = {
            "email": email,
            "vin": vin,
            "preTransaction": preTransaction,
            "preOwner": null,
            "timestamp": timestamp,
            "mileage": null,
            "serviceOne": null,
            "serviceTwo": null,
            "oilChange": null,
            "mainInspection": null,
            "annulmentTarget": null,
            "nextCheck": null
        };
    }

    setPreOwner(preOwner){
        this.data.preOwner = preOwner;
    }

    setMileage(mileage) {
        this.data.mileage = mileage;
    }

    setServiceOne(serviceOne) {
        this.data.serviceOne = serviceOne;
    }

    setServiceTwo(serviceTwo) {
        this.data.serviceTwo = serviceTwo;
    }

    setOilChange(oilChange){
        this.data.oilChange = oilChange;
    }

    setMainInspection(mainInspection){
        this.data.mainInspection = mainInspection;
    }

    annulmentTarget(annulmentTarget){
        this.data.annulmentTarget = annulmentTarget;
    }

    setNextCheck(nextCheck){
        this.data.nextCheck = nextCheck;
    }
}


module.exports = Transaction;
