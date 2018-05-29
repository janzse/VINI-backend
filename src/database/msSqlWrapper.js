import {Connection, Request} from "tedious";

let con = {};
let queryString = "";
let queryCallback = null;

function initConnection(query, callback) {
  console.log("Initializing DB connection");

  queryString = query;
  queryCallback = callback;

  con = new Connection({
    userName: 'vini@vini.database.windows.net',
    password: 't51sy9RbdohKsa',
    server: 'vini.database.windows.net',
    options: {
      encrypt: true,
      database: 'vini-database'
    }
  });

  con.on('connect', function (err) {
    if (err) {
      console.log("Unable to connect to database!", err);
    }
    else {
      console.log("Successfully connected to DB");
      executeSql();
    }
  });
}

let resultValues = [];

function executeSql() {

  const request = new Request(queryString, function (err, rowCount) {
    if (err) {
      console.log("Error while request was performed: ", err);
      return;
    }
    else {
      console.log("Got ", rowCount, " row(s)");
    }

    con.close();
  });

  request.on('row', function (columns) {
    // This collects all non-null rows in an array
    columns.forEach(function (column) {
      if (column.value != null) {
        resultValues.push(column.value);
      }
    });
  });

  request.on('requestCompleted', function () {
    queryCallback(resultValues);
  });

  request.on('error', function (err) {
    console.log("Error while executing ", queryString); // Might not be secure
    throw err;
  });

  con.execSql(request);
}


con.query = (queryString, callback) => {

  initConnection(queryString, callback);
};


module.exports = con;