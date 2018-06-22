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

function generatePassword() {
    let password = '';
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    while(password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/) == null){
        for (var i=0; i<PASSWORD_LENGTH; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            password += chars.substring(rnum,rnum+1);
        }
    }
    return password;
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

module.exports = {
    "toHexString": toHexString,
    "toBasicString": toBasicString,
    "getTimestamp": getTimestamp,
    "USER_LEVEL": USER_LEVEL,
    "TRANS_HASH_SIZE": TRANS_HASH_SIZE,
    "TRANSACTION_STATUS": TRANSACTION_STATUS,
    "FRONTEND_URL": FRONTEND_URL,
    "generatePassword": generatePassword
};
