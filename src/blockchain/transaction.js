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

    setNextCheck(nextcheck){
        this.data.nextcheck = nextcheck;
    }

    setpreOwner(preowner){
        this.data.preOwner = preowner;
    }
};

module.exports = Transaction;
