export class TransactionPayload {

    constructor() {

        //TransactionPayload class could be merged into the Transaction class for more convenience.
        let preTransaction; //String: hash value of the previous TX for faster searching
        let mileage; //unsignedNumber: mileage update of the cars mileage
        let preOwner; //unsignedNumber: amount of previous owners of the car
        let serviceOne; //boolean: servicing/maintenance level one by workshop
        let serviceTwo; //boolean: servicing/maintenance level two by workshop
        let oilChange; //boolean: did the workshop changed the oil
        let inspection; //date: date for the next inspection
        let annulment; //boolean: is this TX an annulmentTransaction or just a regularTransaction

    }
}