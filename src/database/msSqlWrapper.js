import {Connection, Request} from "tedious";

let con = {};

let query = "";
let queryCallback = null;

function initConnection(queryString, callback){
  console.log("Initializing DB connection");

  query = queryString;
  queryCallback = callback;

  con = new Connection({
    userName: 'vini@vini.database.windows.net',
    password: 't51sy9RbdohKsa',
    server: 'vini.database.windows.net',
    options: {
      encrypt: true,
      database: 'testdb'
    }
  });

  con.on('connect', function (err) {
    if(err){
      throw err;
    }
    else{
      console.log("Successfully connected to DB");
      execute(query, queryCallback);
    }
  });
}

let resultValues = [];

function execute(queryString, callback){

  const request = new Request(queryString, function(err, rowCount){
    if(err){
      console.log("ERRR", err);
      throw err;
    }
    else{
      console.log("Got ", rowCount, " rows");
    }

    con.close();
  });

  request.on('row', function (columns) {
    console.log("Got some rows");
    // This collects all non-null rows in an array and calls the given callback with it
    columns.forEach(function (column) {
      if(column.value != null){
        resultValues.push(column.value);
      }
    });
  });

  request.on('requestCompleted', function () {
    callback(resultValues);
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