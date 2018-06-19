test('Transaction instanciate', () => {
    var Transaction=require("../../src/blockchain/transaction");

    let t=new Transaction("sender","receiver","1970-01-01");
    expect(t).toBeInstanceOf(Transaction)
});