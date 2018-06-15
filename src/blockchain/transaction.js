class Transaction {

    from; //String: sender address where the TX originated from (STVAWallet)
    to; //String: recipient address (a carWallet)
    data;

    constructor(from, to) {

        this.from = from;
        this.to = to;
        this.data = {
            "email": null,
            "timestamp": null,
            "preTransaction": null,
            "preOwner": null,
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
        this.data.serviceOne = serviceTwo;
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
}

module.exports = Transaction;
