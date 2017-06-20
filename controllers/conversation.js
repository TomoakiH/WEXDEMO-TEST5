'user strict';

var async = require('async');
var conversation = require('../services/conversation');
var action_control = require('../services/server_action/action_control');

// logger
var path = require('path');
var filename = '[' + path.basename(__filename) + ']';
var logger = require('../utils/logger');

/**
 * control the procedure of conversation.
 * @param {JSON} payload
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
 *   {JSON} context not include server_action.
 */

function control(payload, cb){

  logger.debug(filename, 'control', '0.start');

  // server_action's response text
  var OK_MSG = 'SERVER_OK';
  var NG_MSG = 'SERVER_NG';

  // procedure
  async.waterfall([

    // 1.conversation
    function(next){
      logger.debug(filename, 'control', '1.conversation payload=' + JSON.stringify(payload));

      conversation.message(payload, function(err, conv_result){
        if(err) return next(err);

        next(null, conv_result);
      })
    },

    // 2.server_action. update flg by Conversation Response
    function(conv_result, next){
      logger.debug(filename, 'control', '2.server_action conv_result=' + JSON.stringify(conv_result));

      var server_action_info = conv_result.context.server_action;
      var profile = conv_result.context.profile;

      // skip server_action
      if(typeof server_action_info == 'undefined'){

        is_reply_to_conversation_service = false;
        next(null, conv_result, is_reply_to_conversation_service, null);

      // exec server_action
      }else{

          action_control.exec(server_action_info, profile, function(err, action_result){
            if(err) return next(err);

            // update flg by server_action
            is_reply_to_conversation_service = action_result.is_reply_to_conversation_service;
            next(null, conv_result, is_reply_to_conversation_service, action_result)
          })

      }

    },
    // 3.reply to conversation by server_action_result
    function(conv_result, is_reply_to_conversation_service, action_result, next){
      logger.debug(filename, 'control', '3.reply to conversation conv_result=' + JSON.stringify(conv_result) +
        ', is_reply_to_conversation_service=' + is_reply_to_conversation_service + ', action_result=' + JSON.stringify(action_result));

      // skip reply
      if(!is_reply_to_conversation_service){
        // update profile when exec action
        if(action_result != null){
          conv_result.context.profile = action_result.profile;
        }

        // delete needless properties
        delete conv_result.context.server_action;
        next(null, conv_result);

      // reply to conversation
      }else{

        // create payload
        var new_payload = {
          "input": {"text":null},
          "context": conv_result.context
        }
        // update profile when exec action
        new_payload.context.profile = action_result.profile;

        // set input.text by server_action's result
        if(action_result.is_ok){
          new_payload.input.text = OK_MSG;
        }else{
          new_payload.input.text = NG_MSG;
        }

        // delete needless properties
        delete new_payload.context.client_action;
        delete new_payload.context.server_action;
        delete new_payload.context.final;

        // reply to conversation
        conversation.message(new_payload, function(err, conv_result){
          if(err) return next(err);

          next(null, conv_result);
        })

      }
    }],

    // 4.finish
    function(err, conv_result){
      if(err) return cb(err, null);

      var result = conv_result;
      logger.debug(filename, 'control', '4.finish result=' + JSON.stringify(result));
      cb(null, result);

    }
  )
  // === async_waterfall ===

}


function start(res){

  var payload = {
    input:{
      text: 'conversation_start'
    }
  };

  control(payload, function(err, control_result){
    if(err){
      logger.error(filename, 'start', 'payload=' + JSON.stringify(payload) + ', err=' + JSON.stringify(err));
      res.writeHead( 500, {'Content-type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(err));
      return;
    }

    var result = control_result;
    logger.info(filename, 'start', 'payload=' + JSON.stringify(payload) + ', result=' + JSON.stringify(result));
    res.writeHead( 200, {'Content-type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(result));
  })

}


function continueConv(input, context, res){

  var payload = {
    input: input,
    context: context
  }

  control(payload, function(err, control_result){
    if(err){
      logger.error(filename, 'continue', 'payload=' + JSON.stringify(payload) + ', err=' + JSON.stringify(err));
      res.writeHead( 500, {'Content-type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify(err));
      return;
    }

    var result = control_result;
    logger.info(filename, 'continue', 'payload=' + JSON.stringify(payload) + ', result=' + JSON.stringify(result));
    res.writeHead( 200, {'Content-type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(result));
  })

}

module.exports = {
 'start': start,
 'continue': continueConv
};
