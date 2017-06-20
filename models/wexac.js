/**
 * Functions which calls WEXAC REST API for text analysis. 
 */


// load modules
var request = require('request');



/**
 * Retrieve list of collections in a specified WEXAC server
 */
exports.collections = function(serverUrl, user, password, callback) {
	
	var api = serverUrl + '/api/v10/collections';
	
	var params = {output: 'application/json'}; 
	
	wexacPost(api, params, user, password, function(err, res, body) {
		callback(err, res, body);		
	}); 
}

/**
 * Retrieve facet id and name mapping
 */
exports.facets = function(serverUrl, collectionId, user, password, callback) {
	
	var api = serverUrl + '/api/v10/facets/browse';
	
	var params = {collection: collectionId, output: 'application/json'};
	
	wexacPost(api, params, user, password, function(err, res, body) {
		callback(err, res, body);
	}); 
	
}


/**
 * Retrieve a list of facets and facet values which hit in the given text input (the first argument).
 */
exports.analyze = function(inputText, serverUrl, collectionId, user, password, callback) {
	
	console.log('Text input: ' + inputText);
	
	// create api string
	var api = serverUrl + '/api/v10/analysis/text';
	
	// create request parameters
	var params = {collection:collectionId, text:inputText, output:'application/json'};
	
	// send request and process it
	wexacPost(api, params, user, password, function(err, res, body) {
		callback(err, res, body);		
	});
	
};

/**
 * Utility function to create facet path string from list of facet names.
 */
function pathToKey(path) {
	
	var key = '$';
	
	for (var i=0; i<path.length; ++i) {
		key += '.' + path[i];
	}
	
	return key;
}

/**
 * Create mapping from facet id to facet name. 
 * 
 * Returned value is a hash map of which 
 *  key is facet path id, and
 *  value is facet name separated by slash.
 *  
 *  e.g.
 *  
 *  result['$.path.to.a.facet'] = 'Facet/Name/Slash/Separated'
 */
exports.createFacetIdMap = function(facetsResult, includeDefault) {
	
	var result = {};
	
	if (includeDefault == null) {
		includeDefault = false;
	}
	
	var ns = facetsResult.es_apiResponse.es_namespace;
	
	for (var i=0; i<ns.length; ++i) {				
		if (ns[i].ibmbf_facet) {
			for (var j=0; j<ns[i].ibmbf_facet.length; ++j) {									
				createFacetIdMapAux(ns[i].ibmbf_facet[j], '', result, includeDefault);	
			}			
		}		
	}
	
	return result;
}

/*
 * Support function of createFacetIdMap
 */
function createFacetIdMapAux(currNode, currNamePath, result, includeDefault) {
	
	var id = unescape(currNode.id);	
	
	if (!includeDefault && (id.startsWith('$._') || id.startsWith('$.$'))) {
		return;
	}
	
	
	var namePath;
	if (currNamePath) {
		namePath = currNamePath + '/' + unescape(currNode.label);
	} else {
		namePath = unescape(currNode.label);
	}
	
	result[id] = namePath;
	
	if (currNode.ibmbf_facet) {
		
		for (var i=0; i<currNode.ibmbf_facet.length; ++i) {			
			createFacetIdMapAux(currNode.ibmbf_facet[i], namePath, result);			
		}		
	}	
	
}

/**
 * Transform WEXAC analysis result format to the following one.
 * 
 * Output format: array of object having following properties.
 * 
 * path:	facet path
 * begin:	start position of the span that hit for this facet.
 * end:		end position of the span that hit for this facet.
 * keyword:	facet value.
 * 
 */
exports.extract = function(analysisResult, facetIdMap, includeDefault) {
	
	if (includeDefault == null) {
		includeDefault = false;
	}
	
	var tfs = analysisResult.metadata.textfacets;
	
	var result = [];
	var dupcnt = {};
	
	if (tfs) {
		for (var i=0; i<tfs.length; ++i) {
			var tmp = tfs[i];
			var tmpkey = pathToKey(tmp.path); 
			if (includeDefault || !(tmpkey.startsWith('$._') || tmpkey.startsWith('$.$'))) {
				
				var tmph = tmpkey + '_' + tmp.begin + '_' + tmp.end + '_' + tmp.keyword;
				if (tmph in dupcnt) {
					// check again if really everything match.
					var tt = result[dupcnt[tmph]];
					if (tt.path == tmpkey && tt.begin == tmp.begin && tt.end == tmp.end && tt.keyword == tmp.keyword) {
						continue;
					}
				}
								
				result.push({path:tmpkey, name:facetIdMap[tmpkey], begin: tmp.begin, end: tmp.end, keyword: tmp.keyword});				
				dupcnt[tmph] = result.length-1;
			}			
		}
	}
	
	return result;
};


/**
 * Utility to make post request.
 */
function wexacPost(api, params, user, password, callback) {
	
	// create authentication info.
	var auth = new Buffer(user + ':' + password).toString('base64');
	auth = 'Basic ' + auth; 
	
	// create parameter body
	var sparams = '';
	for (var k in params) {
		sparams += k + '=' + encodeURIComponent(params[k]) + '&';		
	}
	sparams = sparams.substring(0,sparams.length-1);	// remove last '&'
	
	// create request contents
	var req = {
		uri: api,
		method: 'POST',
		headers: {
			Authorization: auth,
			'Content-Type': 'application/x-www-form-urlencoded',
			'accept': 'application/json'
		},
		body: sparams
	};
	
	console.log(req);
	
	request(req, callback);
};


