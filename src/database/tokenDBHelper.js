import dbConnection from "./msSqlWrapper";
import {getTimestamp} from "../utils";

async function saveAccessToken(token, userID, expiration) {

    // ON DUPLICATE gibt es in MSSQL nicht, wird durch eine Query ersetzt
    //const insertTokenQuery = `INSERT INTO bearer_tokens (token, user_id) VALUES ('${token}', ${userID}) ON DUPLICATE KEY UPDATE token = '${token}';`;
    const queryString = `    
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

    return await dbConnection.query(queryString);
}

async function deleteExpiredTokens(){

    const queryString = `DELETE FROM bearer_tokens WHERE expiration < '${getTimestamp()}'`;

    const result = await dbConnection.query(queryString);

    if(result == null){
        console.log("Error while deleting expired bearer tokens");
        return;
    }

    console.log("Successfully deleted possible expired bearer tokens");
}


module.exports = {
    "saveAccessToken": saveAccessToken,
    "deleteExpiredTokens": deleteExpiredTokens
};