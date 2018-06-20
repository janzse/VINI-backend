
function toHexString(key) {
    if(key.substring(0, 2) !== "0x"){
        return "0x" + key;
    }
    return key;
}

function toBasicString(key){
    if(key.substring(0,2) === "0x"){
        return key.substring(2);
    }
    return key;
}

function getTimestamp() {
    const today = new Date();
    const todayStr = today.getFullYear();
    let month = today.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = today.getDate();
    day = day < 10 ? "0" + day : day;

    let hours = today.getHours();
    hours = hours < 10 ? "0" + hours : hours;
    let minute = today.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    let seconds = today.getSeconds();
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return todayStr + "-" + month + "-" + day + "T" + hours + ":" + minute + ":" + seconds;
}

const USER_LEVEL = {
    NOT_LOGGED_IN: 0,
    ZWS: 1,
    TUEV: 2,
    STVA: 3,
    ASTVA: 4
};


module.exports = {
    "toHexString": toHexString,
    "toBasicString": toBasicString,
    "getTimestamp": getTimestamp,
    "USER_LEVEL": USER_LEVEL
};