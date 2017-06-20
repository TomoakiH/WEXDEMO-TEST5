'use strict';

/**
 * @ngdoc service
 * @name clientApp.sharedService
 * @description
 * # conversation
 * Factory in the clientApp.
 */

angular.module('clientApp')
.factory('sharedService', ['$http', function ($http) {
	// Service logic
	var sharedData = {};
	sharedData.wexkeyword = [];

	// Public API here
	return {
		setWexkeyword : function(wexkeyword){
			sharedData.wexkeyword = angular.copy(wexkeyword);
			console.log(sharedData.wexkeyword );
		},
		getWexkeyword: function(){
			console.log(sharedData.wexkeyword );
			return angular.copy(sharedData.wexkeyword);
		}
	};
}]);

