'use strict';

// modules
var watson = require('watson-developer-cloud');
var extend = require('util')._extend;
var cfenv	 = require('cfenv');
var bluemix_dev_services = require('../config/BLUEMIX_SERVICES_FOR_LOCAL.json');
var bluemix = require('../services/bluemix');
var services;

// logger
var path = require('path');
var filename = '[' + path.basename(__filename) + ']';
var logger = require('../utils/logger');

// service
var appEnv = cfenv.getAppEnv();
var credentials_Conversation = settingCredentials_Conversation();
var conversation = watson.conversation(credentials_Conversation);

// settingCredentials_TTS Function
function settingCredentials_Conversation(){
  if (process.env.DEBUG == '1') console.log('settingCredentials_Conversation:');
  if (typeof process.env.VCAP_SERVICES === 'undefined') {
    services = require('../config/BLUEMIX_SERVICES_FOR_LOCAL.json');
    credentials_Conversation = extend({version : 'v1', "version_date": "2016-09-20"},
    services['conversation'][0].credentials); // VCAP_SERVICES
  } else {
    credentials_Conversation = extend({version : 'v1', "version_date": "2016-09-20"},
    bluemix.getServiceCreds('conversation')); // VCAP_SERVICES
  };
  if (process.env.DEBUG == '1') console.log(credentials_Conversation);
  return credentials_Conversation;
};



// variables
var workspace_id = process.env.WORKSPACE_ID || require( '../config/USER_DEFINED_FOR_LOCAL.json' ).CONVERSATION_WORKSPACE_ID;


/**
 * post message to Conversation Service.
 * @param {JSON} payload not need workspace_id. This function set it.
 * @param {function} cb(err, result)
 *
 * {JSON} payload
 *   {JSON} input
 *   {JSON} context
 * {JSON} err {message: "xxx"}
 * {JSON} result
 *   {Array} intents
 *   {Array} entities
 *   {JSON} output
 *     {Array} log_messages
 *     {String} text concatenated texts
 *     {Array} node_visited
 *   {JSON} context
 */
function message(payload, cb){

  payload.workspace_id = workspace_id,

  conversation.message(payload, function(err, data){
    if(err){
      var e = {
        message: err.error
      };
      logger.error(filename, 'start', 'err=' + JSON.stringify(e));
      return cb(e, null);
    }

    // create result
    // concatenate text
    var text_list = data.output.text;
    var text = '';
    for(var i = 0; i < text_list.length; i++){
      text = text + text_list[i];
    }
    data.output.text = text;

    // define final
    if(typeof data.context.final == 'undefined'){
      data.context.final = false;
    }

    var result = data;
    logger.debug(filename, 'message', 'result=' + JSON.stringify(result));

    cb(null, result);
  })

}

module.exports = {
 'message': message
};
