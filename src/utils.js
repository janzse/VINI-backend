const PASSWORD_LENGTH = 8;

const FRONTEND_URL = 'https://sgse18.github.io/VINI/';

function toHexString(key) {
    if (key != null && key.substring(0, 2) !== "0x") {
        return "0x" + key;
    }
    return key;
}

function toBasicString(key) {
    if (key != null && key.substring(0, 2) === "0x") {
        return key.substring(2);
    }
    return key;
}

// Using UTC time (GTM + 00:00)!
function getTimestamp() {

    return new Date().toISOString();
}

const USER_LEVEL = {
    NOT_LOGGED_IN: 0,
    ZWS: 1,
    TUEV: 2,
    STVA: 3,
    ASTVA: 4
};

const TRANS_HASH_SIZE = 64;

const TRANSACTION_STATUS = {
    VALID : "valid",
    INVALID : "invalid",
    PENDING : "open"
};

function isValidMileage(value){
    value = value.toString();
    if(value.length > 7){
        return false
    }
    for (let i = 0 ; i < value.length ; i++) {
        if ((value.charAt(i) < '0') || (value.charAt(i) > '9')) return false
    }
    return true
}


module.exports = {
    "toHexString": toHexString,
    "toBasicString": toBasicString,
    "getTimestamp": getTimestamp,
    "USER_LEVEL": USER_LEVEL,
    "TRANS_HASH_SIZE": TRANS_HASH_SIZE,
    "TRANSACTION_STATUS": TRANSACTION_STATUS,
    "FRONTEND_URL": FRONTEND_URL,
    "PASSWORD_LENGTH": PASSWORD_LENGTH,
    "isValidMileage": isValidMileage
};
