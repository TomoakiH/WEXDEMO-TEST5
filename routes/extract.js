
/*
 * GET home page.
 */

var wexac = require('../models/wexac');
var langModels = require('../models/models.json').models;
var config = require('../config/WEXAC_CONFIG.json');


function createWexacResultObject(hits, content) {
	return {
		hits: hits, 
		content: content
	};
};

function nameToQueryStr(name) {
	var elms = name.split('/');
	var res = '';
	for (var i = 0; i < elms.length; ++i) {
		res += '/"' + elms[i] + '"';
	}
	return res;
}

/**
 * [API] Analyze given text input and return result.
 */
exports.extract = function(req, res) {
	var input = req.body.text;

	wexac.facets(
			config.serverUrl, 
			config.collectionId, 
			config.user, 
			config.password, 
			function (err, resp, body) {

				var errMsg = '';
				if (err) {			
					errMsg += err.toString();					
				}				
				if (resp.statusCode != 200) {
					errMsg += '[' + resp.statusCode + ']: ' + body; 					
				} 
				if (errMsg) {
					res.render('index', {fcn:'error', errMsg: errMsg});
					return;
				}

				console.log(body);

				var result = JSON.parse(body);
				var facetIdMap = wexac.createFacetIdMap(result);


				console.log('Input text: ' + input); 

				try {
					wexac.analyze(input, 
							config.serverUrl, 
							config.collectionId, 
							config.user, 
							config.password, 
							function (err, resp, body) {

						var extractionResult = {errMsg:'', result: body};

						var errMsg = '';
						if (err) {
							errMsg += err.toString();					
						}				
						if (resp.statusCode != 200) {
							errMsg += '[' + resp.statusCode + ']: ' + body; 					
						}


						if (errMsg) {
							extractionResult.errMsg = errMsg;										
						} else {
							console.log("Returned WEX response.");
							console.log(body);
							var wresp = JSON.parse(body);
							var ctt  = wresp.content;
							var hits = wexac.extract(wresp, facetIdMap); 
							var wro = createWexacResultObject(hits, ctt);
							extractionResult.result = wro;
							extractionResult.config = {};
							extractionResult.config.serverUrl = config.serverUrl;
							extractionResult.config.collectionId = config.collectionId;
							console.log(wro);

						}
						res.send(JSON.stringify(extractionResult));

					});
				} catch (e) {
					res.send(JSON.stringify({errMsg: e.message, result:''}));			
				}
			})
};


