test('Init test case', () => {
    expect(1).toBe(1);
});
test('CarAccount instanciate', () => {
    const CarAccount=require("../../src/accounts/carAccount");

    let t=new CarAccount();
    expect(t).not.toBe('undefined');
});