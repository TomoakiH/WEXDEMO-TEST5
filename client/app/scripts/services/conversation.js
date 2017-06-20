'use strict';

/**
* @ngdoc service
* @name clientApp.conversation
* @description
* # conversation
* Factory in the clientApp.
*/
angular.module('clientApp')
.factory('conversation', ['$http', function ($http) {
  // Service logic
  // ...

  // Public API here
  return {
    start: function(cb){
      $http({
        method: 'POST',
        url: '/api/conversation/start',
      })
      .then(function(response){
        console.log(response.data);
        cb(null,response.data);
      })
      .catch(function(e) {
        cb(e,null);
      });
    },
    continue: function(context, input, cb){
      var param = {
        input: {'text': input},
        context: context
      };
      $http({
        method: 'POST',
        url: '/api/conversation/continue',
        data: param
      })
      .then(function(response){
        console.log(response.data);
        cb(null,response.data);
      })
      .catch(function(e) {
        cb(e,null);
      });
    }
  };
}]);
