
function toHexString(key) {
    if(key.substring(0, 2) !== "0x"){
        return "0x" + key;
    }
    return key;
}


module.exports = {
    "toHexString": toHexString
};