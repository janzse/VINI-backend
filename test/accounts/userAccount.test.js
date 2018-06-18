test('Init test case', () => {
    expect(1).toBe(1);
});

// DEPRECATED since the files which are tested are not in use
/*
test('UserAccount class instanciate', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    expect(t).toBeInstanceOf(UserAccount);
});

test('UserAccount set Blocked test', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    t.setBlocked(true);
    expect(t.blocked).toBe(true);
});

test('UserAccount set Blocked false test', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    t.setBlocked(false);
    expect(t.blocked).toBe(false);
});

test('UserAccount set Creation Date test', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    t.setCreationDate("1970-01-01");
    expect(t.creationDate).toBe("1970-01-01");
});

test('UserAccount validate User test', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    t.password="secret";
    expect(t.validateUser("secret")).toBe(true);
});

test('UserAccount dont validate User test', () => {
    const UserAccount=require("../../src/accounts/userAccount");

    let t=new UserAccount();
    t.password="secret";
    expect(t.validateUser("notsecret")).toBe(false);
});*/