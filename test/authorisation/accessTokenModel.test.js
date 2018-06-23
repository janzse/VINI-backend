import {getUser} from "../database/userDBHelper.test"

test('Init test case', () => {
    expect(1).toBe(1);
});

test('Testing getUser', async () => {
    expect.assertions(1);
    const data = await getUser();
    expect(data.email).toEqual('benutzer@zws.com');
});