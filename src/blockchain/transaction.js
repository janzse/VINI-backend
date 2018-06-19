import {toHexString} from "../utils"

class Transaction {

    constructor(from, to, timestamp) {

        this.from = toHexString(from); // String: sender address where the TX originated from (STVAWallet)
        this.to = toHexString(to); // String: recipient address (a carWallet)
        this.gas = 100000; // Default gas
        this.data = {
            "email": null,
            "preTransaction": null,
            "preOwner": null,
            "timestamp": timestamp,
            "mileage": null,
            "serviceOne": null,
            "serviceTwo": null,
            "oilChange": null,
            "inspection": null,
            "annulment": null,
            "nextcheck": null
        };
    }

    setEmail(email) {
        this.data.email = email;
    }

    setPreTransaction(hash){
        this.data.preTransaction = hash;
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

    setOilchange(oilchange){
        this.data.oilChange = oilchange;
    }

    setInspection(inspection){
        this.data.inspection = inspection;
    }

    setAnnulment(annulment){
        this.data.annulment = annulment;
    }

    setNextCheck(nextcheck){
        this.data.nextcheck = nextcheck;
    }
}

module.exports = Transaction;
