import {Connection, Request} from "tedious";

let dbConnection = null;

function query(queryString, callback) {

  if(dbConnection == null){
    initConnection(queryString, callback);
  }
  else{
    executeSql(queryString, callback);
  }
}

function initConnection(query, callback) {
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

  dbConnection.on('connect', function (err) {
    if (err) {
      console.log("Unable to connect to database!", err);
    }
    else {
      console.log("Successfully connected to DB");
      executeSql(query, callback);
    }
  });

  dbConnection.on('end', function () {
    console.log("DB connection has been closed.");
    dbConnection = null;
  })
}

let resultValues = [];

function executeSql(query, callback) {

  const request = new Request(query, function (err, rowCount) {
    if (err) {
      console.log("Error while request was performed: ", err);
      return;
    }
    else {
      console.log("Got ", rowCount, " row(s)");
    }

    dbConnection.close();
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
    callback(null, resultValues);
  });

  request.on('error', function (err) {
    console.log("Error while executing ", query); // Might not be secure
    throw err;
  });

  dbConnection.execSql(request);
}

module.exports = {
  "query": query
};