import {toHexString, toBasicString, getTimestamp} from "../src/utils"

test('toHexStringTest with not formatted string', () => {
    let s="426c6f636b636861696e";
    let r=toHexString(s);
    let isFormattedAsHex=r.substring(0,2) === '0x';
    expect(isFormattedAsHex).toBe(true);
});
test('toHexStringTest with formatted hex string', () => {
    let s="0x426c6f636b636861696e";
    let r=toHexString(s);
    let isFormattedAsHex=r.substring(0,2) === '0x';
    let isSameLen=s.length === r.length;
    expect(isFormattedAsHex && isSameLen).toBe(true);
});
test('toHexStringTest with null', () => {
    let exceptionThrown=true;
    try{
        toHexString(null);
        exceptionThrown=false;
    }catch(ex){
        exceptionThrown=true;
    }
    expect(exceptionThrown).toBe(false);
});
test('toBasicString with not formatted string', () => {
    let s="426c6f636b636861696e";
    let r=toBasicString(s);
    expect(s).toBe(r);
});
test('toBasicString with formatted hex string', () => {
    let s="0x426c6f636b636861696e";
    let r=toBasicString(s);
    let isFormattedAsHex=r.substring(0,2) === '0x';
    expect(isFormattedAsHex).toBe(false);
});
test('toBasicString with null', () => {
    let exceptionThrown=true;
    try{
        toBasicString(null);
        exceptionThrown=false;
    }catch(ex){
        exceptionThrown=true;
    }
    expect(exceptionThrown).toBe(false);
});
//test if getTimestamp() returns a valid datetime iso string
test('getTimestamp test', () => {
    let isoRegex=/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    let time=getTimestamp();
    expect(isoRegex.test(time)).toBe(true);
});