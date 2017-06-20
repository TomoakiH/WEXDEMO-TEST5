'use strict';

var server_action_001 = require('./server_action_001');


/**
 * exec each server_action.
 * @param {JSON} server_action_info server_action information from Conversation Service
 * @param {JSON} profile user's profile from Conversation Service
 * @param {function} cb(err, result)
 *
 * {JSON} server_action_info
 *   {String} server_action_id
 *   {Any} key
 * {JSON} profile
 *   {Any} key
 * {JSON} err {message: "xxx"}
 * {JSON} result
 *   {Boolean} is_reply_to_conversation_service reply the result and profile to the Conversation Service
 *   {JSON} profile
 */
function exec(server_action_info, profile, cb){

  var id = server_action_info.server_action_id;

  switch(id){
		case '001':
			server_action_001.exec(server_action_info, profile, cb);
			break;
  }
}

module.exports = {
    exec: exec
};
