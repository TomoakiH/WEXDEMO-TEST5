'use strict';

/**
 * @ngdoc service
 * @name clientApp.conversation
 * @description
 * # conversation
 * Factory in the clientApp.
 */
angular.module('clientApp')
.factory('extract', ['$http', function ($http) {
	// Service logic
	// ...
	function nameToQueryStr(name) {
		var elms = name.split('/');
		var res = '';
		for (var i = 0; i < elms.length; ++i) {
			res += '/"' + elms[i] + '"';
		}
		return res;
	}

	// Public API here
	return {
		extract: function(question, callback){
			var data = new Object();
			data.collection = 'MLIT';
			data.text = question;
			data.output = 'application/json';

			var transform = function(data){
				return $.param(data);
			};

			$http({
				method: 'POST',
				url: '/extract',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				transformRequest: transform,
				data: data
			})
			.then(function(response){
				console.log(response.data);
				callback(null,response.data);
			})
			.catch(function(e) {
				callback(e,null);
			});
		},
		createWexacLink: function(config, hits, wexkeyword, callback) {
			var resultLink = config.serverUrl;

			if (!resultLink.endsWith('/')) {
				resultLink += '/';
			}
			resultLink += 'ui/analytics/advanced?query=((*:*)';

			// hitsをWEX ACの問い合わせキーワードに追加
			for (var i = 0; i < hits.length; ++i) {
				if(hits[i].exclude){
					resultLink += ' AND (keyword::' + nameToQueryStr(hits[i].name) + '/"' +
					hits[i].keyword + '")';
				}
			}

			// wexkeywordをWEX ACの問い合わせキーワードに追加
			for (var i = 0; i < wexkeyword.length; ++i){
				if(wexkeyword[i].exclude && wexkeyword[i].name_facet !== ""){
					resultLink += ' AND (keyword::' + nameToQueryStr(wexkeyword[i].name_facet) + '/"' +
					wexkeyword[i].value + '")';
				}
			}

			resultLink += ')';
			resultLink += '&collections=' + config.collectionId;

			callback(resultLink);
		}
	};
}]);
