'use strict';

var express = require('express');
var router = express.Router();

var conversation = require("../controllers/conversation");

// logger
var path = require('path');
var filename = '[' + path.basename(__filename) + ']';
var logger = require('../utils/logger');


// [POST] Conversation Start
router.post('/api/conversation/start', function(req , res) {

  logger.info(filename, 'start', 'req.body=' + JSON.stringify(req.body));

  conversation.start(res);
});

// [POST] Conversation Continue
router.post('/api/conversation/continue', function(req , res) {
  var input = req.body.input;
  var context = req.body.context;

  logger.info(filename, 'continue', 'req.body=' + JSON.stringify(req.body));

  conversation.continue(input, context, res);
});

module.exports = router;
