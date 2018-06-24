import * as data from "../__mockData__/readUser.json"

test('Init test case', () => {
    expect(1).toBe(1);
});

export async function getUser() {
    let user = data;
    return user;
}

export async function registerUser(email, pwd, authLevel, forename, surname, companyName, creationDate) {
    if (email == null || pwd == null || authLevel == null ||
        forename == null || companyName == null || creationDate == null) {
        console.err("Daten unvollständig. Benutzer konnte nicht angelegt werden.");
    }
    const benutzer = JSON.stringify({
        "email": email,
        "password": pwd,
        "privateKey": "9012381940asdjajdklasjasklf04urohdasd",
        "authorityLevel": authLevel,
        "forename": forename,
        "surname": surname,
        "companyName": companyName,
        "creationDate": creationDate,
        "blocked": false,
        "publicKey": "901opiajdoas0asd242588asjasklf04urohda"
    });

    return new Promise(function(resolve, reject) {
        const fs = require('fs');
        fs.writeFile('./test/__mockData__/writeUser.json', benutzer, function (err) {
            if (err !== null)
                reject(err);
            else
                resolve(true);
        });
    });
}

export async function doesUserExist(email)
{
    if (email !== null || email !== undefined)
    {
        return new Promise(function(resolve, reject) {
            const fs = require('fs');
            fs.readFile('./test/__mockData__/writeUser.json', function (err, data) {
                if (!err) {
                    const content = JSON.parse(data);
                    resolve(content.blocked);
                }
                else
                    reject(err);
            });

        });
    }
}