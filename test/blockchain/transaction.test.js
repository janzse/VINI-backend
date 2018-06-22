import Transaction from "../../src/blockchain/transaction"

test('Transaction instanciate', () => {
    let t=new Transaction("0x",null,null,null,"0x",null);
    expect(t).toBeInstanceOf(Transaction)
});
test('Transaction constructor test from', () => {
    let t=new Transaction("0x",null,null,null,"0x",null);
    expect(t.from).toBe("0x");
});
test('Transaction constructor test to', () => {
    let t=new Transaction("0x",null,null,null,"0x",null);
    expect(t.to).toBe("0x");
});
test('Transaction constructor test timestamp', () => {
    let t=new Transaction("0x",null,null,null,"0x","1970-01-01");
    expect(t.data.timestamp).toBe("1970-01-01");
});
test('Transaction set test mileage', () => {
    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setMileage(1234);
    expect(t.data.mileage).toBe(1234);
});

test('Transaction set test service one', () => {

    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setServiceOne("1970-01-01");
    expect(t.data.serviceOne).toBe("1970-01-01");
});

test('Transaction set test service two', () => {

    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setServiceTwo("1970-01-01");
    expect(t.data.serviceTwo).toBe("1970-01-01");
});
test('Transaction set test oil change', () => {

    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setOilChange("1970-01-01");
    expect(t.data.oilChange).toBe("1970-01-01");
});

test('Transaction set test next check', () => {

    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setNextCheck("1972-01-01");
    expect(t.data.nextCheck).toBe("1972-01-01");
});

test('Transaction set test preowner', () => {

    let t=new Transaction("0x",null,null,null,"0x",null);

    t.setPreOwner(42);
    expect(t.data.preOwner).toBe(42);
});