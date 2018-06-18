test('Init test case', () => {
    expect(1).toBe(1);
});
test('Transaction instanciate', () => {
    const Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction();
    expect(t).toBeInstanceOf(Transaction)
});