import {TransactionPayload} from "./transactionPayload";


export class Transaction {

    constructor(){

        let hash; //String: the hash value of the TX
        let timestamp; //date: creation date of the TX
        let from; //String: sender address where the TX originated from (STVAWallet)
        let to; //String: recipient address (a carWallet)
        let isValid; //boolean: describes if a TX is still valid(true) or got annulled (false)

        let payload; // = new TransactionPayload(); //TransactionPayload: the payload for this TX

    }

    sendTransactionTUEV(){
        this.payload = new TransactionPayload();
    }

    sendTransactionSTVA(){
        this.payload = new TransactionPayload();
    }
    sendTransactionZWS(){
        this.payload = new TransactionPayload();
    }

    sendAnnulment(){
        this.payload = new TransactionPayload();
    }
}