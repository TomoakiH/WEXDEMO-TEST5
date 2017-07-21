'use strict';

var express = require('express');
var router = express.Router();
var conversation = require('./conversation');
var extract = require('./extract');
var sttTts = require('./sttTts');

// conversation
router.all('/api/conversation/*',  conversation);

//extract
router.post('/extract', extract.extract);

// STT get token route
router.all('/api/synthesize', sttTts);  //
router.all('/api/speech-to-text/token', sttTts);
router.all('/api/text-to-speech/token', sttTts);

module.exports = router;
