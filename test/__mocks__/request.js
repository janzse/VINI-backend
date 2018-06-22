import * as data from "../__mockData__/users.json"

export async function getUser() {
    let user = data;
    return user;
}