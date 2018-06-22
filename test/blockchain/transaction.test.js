test('Transaction instanciate', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01 12:00:00.100");
    expect(t).toBeInstanceOf(Transaction)
});
test('Transaction constructor test from', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01 12:00:00.100");
    expect(t.from).toBe("0x");
});
test('Transaction constructor test to', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01 12:00:00.100");
    expect(t.to).toBe("0x");
});
test('Transaction constructor test timestamp', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01");
    expect(t.data.timestamp).toBe("1970-01-01");
});
/*
test('Transaction set test email', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x","0x","1970-01-01");
    t.setEmail("block@chain.de")
    expect(t.data.email).toBe("block@chain.de");
});
*/
test('Transaction set test mileage', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01 12:00:00.100");
    t.setMileage(1234);
    expect(t.data.mileage).toBe(1234);
});

test('Transaction set test service one', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x", "1970-01-01");
    t.setServiceOne("1970-01-01");
    expect(t.data.serviceOne).toBe("1970-01-01");
});

test('Transaction set test service two', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x", "1970-01-01");
    t.setServiceTwo("1970-01-01");
    expect(t.data.serviceTwo).toBe("1970-01-01");
});
test('Transaction set test oil change', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x", "1970-01-01");
    t.setOilChange("1970-01-01");
    expect(t.data.oilChange).toBe("1970-01-01");
});

test('Transaction set test next check', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01");
    t.setNextCheck("1972-01-01");
    expect(t.data.nextCheck).toBe("1972-01-01");
});

test('Transaction set test preowner', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("0x", "test@test.de", "WDD0000000", "0x", "0x","1970-01-01 12:00:00.100");
    t.setPreOwner(42);
    expect(t.data.preOwner).toBe(42);
});