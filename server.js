#!/usr/bin/env node

'use strict';

var app = require('./app');
var path = require('path');

// logger
var filename = '[' + path.basename(__filename) + ']';
var logger = require('./utils/logger');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  logger.info(filename, 'app.listen', 'Express server listening on port ' + server.address().port);
});
