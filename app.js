var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var MySQLStore = require('express-mysql-session')(session);
var options={
    host: '*',
    port: '*',
    user: '*',
    password: '*',
    database: '*'
}
var sessionStore = new MySQLStore(options);
app.use(session({
    secret: '12312ASDask!@#1124',
    resave: false,//접속할때마다 새로발급하지않는다
    saveUninitialized: true,
    store:sessionStore
}));

app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views_ejs'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//router
var board = require('./routes/board');
var index = require('./routes/index');
var users = require('./routes/users');
var passport = require('./config/mysql/passport')(app);
var auth = require('./routes/auth')(passport);

app.use('/board',board);
app.use('/', index);
app.use('/users', users);
app.use('/auth',auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
