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

module.exports = {
    "toHexString": toHexString,
    "toBasicString": toBasicString,
    "getTimestamp": getTimestamp,
    "USER_LEVEL": USER_LEVEL,
    "TRANS_HASH_SIZE": TRANS_HASH_SIZE,
    "TRANSACTION_STATUS": TRANSACTION_STATUS
};
