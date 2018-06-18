test('Init test case', () => {
    expect(1).toBe(1);
});

test('UserAccount class instanciate', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    expect(t).not.toBe('undefined');
});