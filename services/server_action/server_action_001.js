'user strict';


/**
 * get recommend product from DB by using server_action_info's search conditions.
 * @param {JSON} server_action_info
 * @param {JSON} profile
 * @param {function} cb(err, result)
 *
 * {JSON} server_action_info
 *   {String} server_action_id
 *   {Any} key
 * {JSON} profile
 *   {Any} key
 * {JSON} err {message: "xxx"}
 * {JSON} result
 *   {Boolean} is_reply_to_conversation_service true
 *   {Boolean} is_ok true when server_action's result is success
 *   {JSON} profile
 *     {String} recommend_product add by this action
 *
 */
function exec(server_action_info, profile, cb){

  var recommend_product = 'MOTOMAN-AR700';
  profile.recommend_product = recommend_product;

  var result = {
    'is_reply_to_conversation_service': true,
    'is_ok': true,
    'profile': profile,
  };

  cb(null, result);

}

module.exports = {
    exec: exec
};
