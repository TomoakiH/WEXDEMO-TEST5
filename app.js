'use strict';

// modules
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var routes = require('./routes');

// express application
var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// basic auth
var auth = require('http-auth');
var basic = auth.basic({
  realm: "Default",
  file: __dirname + '/config/basic_auth/default.htpasswd'
});
app.use(auth.connect(basic));


// middleware settings
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit:'1mb',extended: true}));
app.use(methodOverride('_method'));
if(env == 'development') {
  app.use(express.static(path.join(__dirname, './client/app')));
  app.use('/bower_components', express.static(path.join(__dirname, './client/bower_components')));
}
else app.use(express.static(path.join(__dirname, './client/dist')));

app.use('/', routes);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

/*
// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});
*/

module.exports = app;
