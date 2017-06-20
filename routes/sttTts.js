/*
IBM Confidential
OCO Source Materials
6949-63A
(c) Copyright IBM Corp. 2016
*/

'use strict';

/*****************************************************************************
Define Valuable Section
*****************************************************************************/
var express = require('express'); // express
var watson = require('watson-developer-cloud'); // watson developer cloud
var bluemix = require('../services/bluemix');
var extend       = require('util')._extend;
var _ = require("underscore"); // アンダースコア
var services; // Bluemixサービスの定義を格納
var router = express.Router(); // create a new express server

//  Text to Speech 初期設定
var credentials_TTS = settingCredentials_TTS();
console.log("credentials_TTS:");
console.log(credentials_TTS);
var textToSpeech = watson.text_to_speech(credentials_TTS);
var ttsAuthService = watson.authorization(credentials_TTS);

// Speech to Text 初期設定
var credentials_STT = settingCredentials_STT();
console.log("credentials_STT:");
console.log(credentials_STT);
var speechToText = watson.speech_to_text(credentials_STT);
var sttAuthService = watson.authorization(credentials_STT);

// settingCredentials_STT Function
function settingCredentials_STT(){
  if (process.env.DEBUG == '1') console.log('settingCredentials_STT:');
  if (typeof process.env.VCAP_SERVICES === 'undefined') {
    services = require('../config/BLUEMIX_SERVICES_FOR_LOCAL.json');
    credentials_STT = extend({version : 'v1'},
    services['speech_to_text'][0].credentials); // VCAP_SERVICES
  } else {
    credentials_STT = extend({version : 'v1'},
    bluemix.getServiceCreds('speech_to_text')); // VCAP_SERVICES
  };
  if (process.env.DEBUG == '1') console.log(credentials_STT);
  return credentials_STT;
};

// settingCredentials_TTS Function
function settingCredentials_TTS(){
  if (process.env.DEBUG == '1') console.log('settingCredentials_TTS:');
  if (typeof process.env.VCAP_SERVICES === 'undefined') {
    services = require('../config/BLUEMIX_SERVICES_FOR_LOCAL.json');
    credentials_TTS = extend({version : 'v1'},
    services['text_to_speech'][0].credentials); // VCAP_SERVICES
  } else {
    credentials_TTS = extend({version : 'v1'},
    bluemix.getServiceCreds('text_to_speech')); // VCAP_SERVICES
  };
  if (process.env.DEBUG == '1') console.log(credentials_TTS);
  return credentials_TTS;
};


// 音声合成用 API
router.get('/api/synthesize', function(req, res, next) {
  var transcript = textToSpeech.synthesize(req.query);
  if (process.env.DEBUG == '1') console.log('/api/synthesize:' + req.query);
  transcript.on('response', function(response) {
    if (req.query.download) {
      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
    };
  });
  transcript.on('error', function(error) {
    next(error);
  });
  transcript.pipe(res);
});

// Text to Speech Token を受け取るAPI
router.get('/api/text-to-speech/token', function (req, res) {
  ttsAuthService.getToken({url: credentials_TTS.url}, function (err, token) {
    if (err) {
      console.log('Error retrieving token: ', err);
      res.status(500).send('Error retrieving token');
      return;
    }
    if (process.env.DEBUG == '1') console.log('/api/text-to-speech/token: ' + token);
    res.send(token);
  });
});

// Speech to Text Token を受け取るAPI
router.get('/api/speech-to-text/token', function (req, res) {
  sttAuthService.getToken({url: credentials_STT.url}, function (err, token) {
    if (err) {
      console.log('Error retrieving token: ', err);
      res.status(500).send('Error retrieving token');
      return;
    }
    if (process.env.DEBUG == '1') console.log('/api/speech-to-text/token: ' + token);
    res.send(token);
  });
});


// catch 404 and forward to error handler
router.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.code = 404;
  err.message = 'Not Found';
  next(err);
});

// error handler
router.use(function(err, req, res, next) {
  var error = {
    code: err.code || 500,
    error: err.message || err.error
  };
  console.log('error:', error);
  res.status(error.code).json(error);
});

// モジュールのエクスポート
module.exports = router;
