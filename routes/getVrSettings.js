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
// var _ = require("underscore"); // アンダースコア
var services; // Bluemixサービスの定義を格納
var router = express.Router(); // create a new express server

//  Visual Recognition 初期設定
var credentials_VR = settingCredentials_VR();
console.log("credentials_VR:");
console.log(credentials_VR);
// var vR = watson.visual_recognition(credentials_VR);

// settingCredentials_STT Function
function settingCredentials_VR(){
  if (process.env.DEBUG == '1') console.log('settingCredentials_VR:');
  if (typeof process.env.VCAP_SERVICES === 'undefined') {
    services = require('../config/BLUEMIX_SERVICES_FOR_LOCAL.json');
    credentials_VR = extend({version : 'v3'},
    services['watson_vision_combined'][0].credentials); // VCAP_SERVICES
  } else {
    credentials_VR = extend({version : 'v3'},
    bluemix.getServiceCreds('watson_vision_combined')); // VCAP_SERVICES
  };
  if (process.env.DEBUG == '1') console.log("credentials_VR" + credentials_VR);
  return credentials_VR;
};

// Visual Recognition　の設定を受け取るAPI
router.get('/api/getVrSettings', function (req, res) {
  console.log("start get /api/getVrSettings");
  console.log(credentials_VR);
  res.send(credentials_VR);
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
