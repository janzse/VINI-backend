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
      "annulment": null
    };
  }

  setEmail(email){
    this.data.email = email;
  }

  setMileage(mileage) {
    this.data.mileage = mileage;
  }
}

module.exports = Transaction;
