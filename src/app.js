/**
 *
 * @author unknown
 * @author mteuber
 */

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//rest API routes
app.use('/', require('./routes/root'));
app.use('/api/car', require('./routes/api/car/root'));
app.use('/api/car/applyCancelTransaction', require('./routes/api/car/applyCancelTransaction'));
app.use('/api/car/cancelTransaction', require('./routes/api/car/cancelTransaction'));
app.use('/api/car/mileage', require('./routes/api/car/mileage'));
app.use('/api/car/register', require('./routes/api/car/register'));
app.use('/api/car/service', require('./routes/api/car/service'));
app.use('/api/car/tuev', require('./routes/api/car/tuev'));
app.use('/api/user/register', require('./routes/api/user_register'));
app.use('/api/login', require('./routes/api/login'));

//test routes
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({"error": err.status});
});

const port = process.env.port || 4711;

app.listen(port);
console.log("Server is running on port", port);


module.exports = app;
