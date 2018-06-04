/*
@author=Lukas Stuckstette
*/
import UserAccount from "./userAccount";
import CarAccount from "./carAccount";
import EthNode from "../blockchain/ethNode"
import { } from "../database/userDBHelper";

//Creates a new eth-private-key, creates a new UserAccount object and stores it in the db.
function createUserAccount(email, password, authorityLevel, forename, surname, companyName) {
    var privateKey = EthNode.createUserAccount();
    var newUseraccount = new UserAccount(privateKey, email, password, authorityLevel, forename, surname, companyName);
    newUseraccount.setBlocked(false);
    newUseraccount.setCreationDate(Date.now);
    return storeUser(newUseraccount);
}

//Creates a new eth-private-key, creates a new CarAccount object and stores it in the db.
function createCarAccount(vin) {
    var privateKey = EthNode.createCarAccount();
    var newCarAccount = new CarAccount(privateKey, vin);
    return storeCar(newCarAccount);
}

//fetches a UserAccount object from the db, changes the blocked state to true and writes it back to the db.
function deactivateUserAccount(email) {
    var userToBlock = getUser(email);
    usertoBlock.setBlocked(true);
    return storeUser(userToBlock);
};