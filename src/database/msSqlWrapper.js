import {Connection, Request} from "tedious";
import {DATABASE} from "../passwords";

let dbConnection = null;

async function query(queryString) {

    if (dbConnection == null) {
        const conSuccess = await initConnection();

        if (!conSuccess) {
            return null;
        }
    }

    return await executeSql(queryString);
}

function initConnection() {
    // Use of explicit promise, because of the event listeners
    return new Promise((resolve) => {
        console.log("Initializing DB connection");

        dbConnection = new Connection({
            userName: DATABASE.USER,
            password: DATABASE.PASSWORD,
            server: DATABASE.SERVER,
            options: {
                encrypt: true,
                database: DATABASE.DATABASE
            }
        });

        dbConnection.on('connect', (err) => {
            if (err) {
                console.log("Unable to connect to database!", err);
                resolve(null);
            }
            else {
                console.log("Successfully connected to DB");
                resolve(true);
            }
        });

        dbConnection.on('end', () => {
            console.log("DB connection has been closed.");
            dbConnection = null;
        });
    });
}

function executeSql(query) {
    // Use of explicit promise, because of the event listeners
    return new Promise((resolve) => {

        let resultValues = [];

        const request = new Request(query, (err, rowCount) => {
            if (err) {
                console.log("Error while request was performed: ", err);
                resolve(null);
                return;
            }
            else {
                console.log("Got", rowCount, "row(s)");
            }
            dbConnection.close();
        });

        request.on('requestCompleted', () => {
            console.log("Request completed");
            resolve(resultValues);
        });

        request.on('row', (columns) => {
            // This collects all non-null rows in an array
            columns.forEach((column) => {
                resultValues.push(column.value);
            });
        });

        request.on('error', (err) => {
            console.log("Error while executing ", query, ":\n", err); // Might not be secure
            resolve(null);
        });

        dbConnection.execSql(request);
    });
}


module.exports = {
    "query": query
};