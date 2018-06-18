/*
@author=Lukas Stuckstette
*/
import UserAccount from "./userAccount";
import CarAccount from "./carAccount";
import EthNode from "../blockchain/initEthNode"
import {storeUser, storeCar} from "../database/dbHelper";

//Creates a new eth-private-key, creates a new UserAccount object and stores it in the db.
function createUserAccount(email, password, authorityLevel, forename, surname, companyName, callback) {
    let privateKey = EthNode.createUserAccount();
    let newUseraccount = new UserAccount(privateKey, email, password, authorityLevel, forename, surname, companyName);
    newUseraccount.setBlocked(false);
    newUseraccount.setCreationDate(Date.now);
    registerUserInDB();
}

//Creates a new eth-private-key, creates a new CarAccount object and stores it in the db.
function createCarAccount(vin) {
    let privateKey = EthNode.createCarAccount();
    let newCarAccount = new CarAccount(privateKey, vin);
    return storeCar(newCarAccount);
}

//fetches a UserAccount object from the db, changes the blocked state to true and writes it back to the db.
function deactivateUserAccount(email) {
    let userToBlock = getUser(email);
    usertoBlock.setBlocked(true);
    return storeUser(userToBlock);
};

module.exports = {
    "createUserAccount": createUserAccount,
    "createCarAccount": createCarAccount,
    "deactivateUserAccount": deactivateUserAccount
};
