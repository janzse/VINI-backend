import dbConnection from "./msSqlWrapper";

async function saveAccessToken(token, userID, expiration) {

    // ON DUPLICATE gibt es in MSSQL nicht, wird durch eine Query ersetzt
    //const insertTokenQuery = `INSERT INTO bearer_tokens (token, user_id) VALUES ('${token}', ${userID}) ON DUPLICATE KEY UPDATE token = '${token}';`;
    const insertTokenQuery = `    
    begin tran
    if exists (select * from bearer_tokens with (updlock,serializable) where user_id LIKE '${userID}')
    begin
    update bearer_tokens
    set token = '${token}', expiration = '${expiration.toISOString()}'
        where user_id = '${userID}';
    end
    else
    begin
    insert into bearer_tokens (token, user_id, expiration) values ('${token}', ${userID}, '${expiration.toISOString()}');
    end
    commit tran`;

    return await dbConnection.query(insertTokenQuery);
}

async function deleteAccessToken(userID)
{
    const insertTokenQuery = `DELETE FROM bearer_token WHERE user_id = '${userID}'`;

    await dbConnection.query(insertTokenQuery);
}

async function getUserIDFromAccessToken(token) {

    const getUserIDQuery = `SELECT user_id FROM bearer_tokens WHERE token = '${token}';`;

    const result = await dbConnection.query(getUserIDQuery);

    if(result == null || result.length === 0){
        return null;
    }

    return result[0];
}


module.exports = {
    "saveAccessToken": saveAccessToken,
    "getUserIDFromAccessToken": getUserIDFromAccessToken,
    "deleteAccessToken": deleteAccessToken
};