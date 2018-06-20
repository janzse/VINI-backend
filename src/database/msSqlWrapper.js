import {Connection, Request} from "tedious";

let dbConnection = null;

//TODO: Datenbankverbindung offen halten, statt jedes Mal zu schließen?

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
            userName: 'vini@vini.database.windows.net',
            password: 't51sy9RbdohKsa',
            server: 'vini.database.windows.net',
            options: {
                encrypt: true,
                database: 'vini-database'
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

        console.log("Begin query.");
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
                if (column.value != null) {
                    if (column.metadata.colName === "transactionHash")
                        resultValues.push("0x"+column.value);
                    else
                        resultValues.push(column.value);
                }
            });
        });

        request.on('error', (err) => {
            console.log("Error while executing ", query, ":\n", err); // Might not be secure
            resolve(null);
        });

        dbConnection.execSql(request);
        console.log("End of query.")
    });
}

//TODO: Auf async/await ändern, sofern verwendet
function executeSqlJSON(query) {
    let entries = [];
    // Use of explicit promise, because of the event listeners
    return new Promise((resolve) => {

        console.log("Begin query.");
        let resultValues = [];

        const request = new Request(query, (err, rowCount) => {
            if (err) {
                console.log("Error while request was performed: ", err);
                return;
            }
            else {
                console.log("Got", rowCount, "row(s)");
            }
            dbConnection.close();
        });

        request.on('requestCompleted', () => {
            resolve(resultValues);
        });

        request.on('row', (columns) => {
            let entry = [];
            // This collects all non-null rows in an array
            columns.forEach((column) => {
                entry.push({[column.metadata.colName]: [column.value]});
            });
             entries.push(entry);
        });

        request.on('error', (err) => {
            console.log("Error while executing ", query, ":\n", err); // Might not be secure
            resolve(null);
        });

        dbConnection.execSql(request);
        console.log("End of query.")
    });
}

module.exports = {
    "query": query
};