'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
.controller('SearchCtrl', ["extract","sharedService","sttTts", "$location",  function (extract, sharedService, sttTts, $location) {

	var self = this;

	//変数
	this.question = '';
	this.questions = '';
	this.status = '';
	this.data = {};
	this.analysis_data = [];
	this.analysis_check = true;
	this.wexkeyword = sharedService.getWexkeyword();
	this.wexlink = '';


	//関数
	this.analyze = function(){
		console.log(this.data);

		if (typeof this.data.config === 'undefined') {

			extract.extract('', function(e, res_data){
				console.log("dummy extract");
				self.data = res_data;
				console.log(self.data);

				extract.createWexacLink(self.data.config, self.data.result.hits, self.wexkeyword, function(resultLink){
					console.log(resultLink);
					self.wexlink = resultLink;
					window.open(self.wexlink);
				});
			});

		}else {
			extract.createWexacLink(this.data.config, this.data.result.hits, this.wexkeyword, function(resultLink){
				self.wexlink = resultLink;
				window.open(self.wexlink);
			});
		}
	};

	this.feedbackQuestion = function () {
		this.status = '質問文を解析中...';
		this.data = {};

		this.questions += this.question + "<BR>";
		console.log("questions:" + self.questions);

		extract.extract(this.question, function(e, res_data){
			self.data = res_data;
			// self.analysis_data = self.data.result.hits;
			Array.prototype.push.apply(self.analysis_data,self.data.result.hits);

			if(self.analysis_data.length === 0) { //　分析開始ボタンを無効化
				self.analysis_check = true;
			}
			else{　　　　　　　　　　　　　　　　　　　　　　　　　　　　　//　分析開始ボタンを有効化
				self.analysis_check = false;
			}

			for (var info in self.analysis_data){
				self.analysis_data[info].exclude = true;
			}

			self.status = '';
		});

		this.question = '';
	};

	this.clearAnalyze = function() {
		this.data = {};
		this.questions = '';
		this.analysis_data = [];
	};


	this.startSTT = function() {
		sttTts.startSTT(function(err, startSTTText) {
			if (err) {return console.log(err);}
			console.log(startSTTText);
			self.question = startSTTText;
			self.feedbackQuestion();
		});
	};

}]);
