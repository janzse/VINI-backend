import {registerUser} from "../database/userDBHelper.test";

test('Init test case', () => {
    expect(1).toBe(1);
});

test('Testing registerUser', async () => {
    expect.assertions(1);
    const email = "abc@abc.de";
    const pwd = "*****";
    const authLevel = 2;
    const forename = "Max";
    const surname = "Mustermann";
    const companyName = "Firma";
    const creationDate = new Date();

    const callback = await registerUser(email, pwd, authLevel, forename, surname, companyName, creationDate);
    expect(callback).toBe(true);
});