'use strict';

/**
* @ngdoc function
* @name clientApp.controller:DialogCtrl
* @description
* # DialogCtrl
* Controller of the clientApp
*/
angular.module('clientApp')
.controller('DialogCtrl', ["conversation","sharedService", "sttTts", "vr", "$window", "$timeout", "$uibModal", "$scope", "$http", function (conversation, sharedService, sttTts, vr, $window, $timeout, $uibModal, $scope, $http) {

	var self = this;
	var context;

	//画像ファイルを読み取り画面に表示するためのwatch文
	// $scope.$watch("file",function(file){
	//
	// 		$scope.srcUrl = undefined;
	// 		//画像ファイルじゃなければ何もしない
	// 		if(!file || !file.type.match("image.*")){
	// 				return;
	// 		}
	// 		//new FileReader API
	// 		var reader = new FileReader();
	// 		//callback
	// 		reader.onload １= function(){
	// 				$scope.$apply(function(){
	// 						$scope.srcUrl = reader.result;
	// 				});
	// 		};
	// 		//read as url(reader.result = url)
	// 		reader.readAsDataURL(file)
	// });

	this.wexkeyword = sharedService.getWexkeyword();

	function isKeywordExists(array, keyword) {
		for (var i =0, len = array.length; i < len; i++) {
			if ( array[i].name_facet === keyword.name_facet && array[i].value === keyword.value ){
				return true;
			}
		}
		return false;
	}

	function updateContext(new_context){
		context = angular.extend({},new_context);
		if(new_context.client_action !== null){
			context.client_action = null;
			clientAction(new_context.client_action);
		}

		// wexkeywordの重複を排除
		for(var keyword in context.profile.wexkeyword){
			if(context.profile.wexkeyword[keyword].value !== "" && !isKeywordExists(self.wexkeyword, context.profile.wexkeyword[keyword])){
				self.wexkeyword.push(context.profile.wexkeyword[keyword]);
				self.wexkeyword[self.wexkeyword.length - 1].exclude = true;
			}
		}

		// search用にkeywordを共有領域に保存
		sharedService.setWexkeyword(self.wexkeyword);

	}

	var example_timer = "end";
	var example_array;
	var example_index;
	function changeInputExample(){
		if (example_index === example_array.length){
			example_index = 0;
		}
		self.input_example = example_array[example_index];
		example_index += 1;
		example_timer = $timeout(function(){changeInputExample(); return "end";}, 3000);
	}

	function stopExampleTimer(){
		if(example_timer !== "end"){
			$timeout.cancel(example_timer);
			example_timer = "end";
		}
	}

	function clientAction(client_action){
		// console.log(client_action);
		angular.forEach(client_action, function(client_action_ele, index) {
			console.log(client_action_ele);
			switch (client_action_ele.client_action_id) {
				case "001":
				example_array = client_action_ele.candidates;
				example_index = 0;
				changeInputExample();
				break;

				case "showModal":
				showModal($scope, $uibModal, client_action_ele.client_action_modalHeader,
				client_action_ele.client_action_modalMessage, client_action_ele.client_action_modalFooter, client_action_ele.client_action_nextMessage,self);
				break;

				default:
			}
		});
	}
	function scrollToBottom(){
		angular.element('body,html').animate({scrollTop:angular.element("#dialog_bottom").offset().top}, 400);
	}

	this.receiveUserText = function(){
		var input = this.user_text;
		this.user_text = "";
		stopExampleTimer();
		this.input_example = "";
		this.dialog_history.push({text: input, speaker: "user", textType: true });
		conversation.continue(context, input, function(e, data){
			if(e){
				self.dialog_history.push({text: "エラーが発生しました", speaker: "watson", textType: true });
			}else{
				updateContext(data.context);

				if(data.context.profile.link_text !== ""){
					var link_target = (data.context.profile.link_url.indexOf("http") == 0) ? "_blank" : "_self";
					self.dialog_history.push({text: data.output.text, link_text: data.context.profile.link_text, link: data.context.profile.link_url, link_target: link_target, speaker: "watson", linkType: true });
				}else if (data.output.text != ""){
					self.dialog_history.push({text: data.output.text, speaker: "watson", textType: true });
				}
				if(data.context && data.context.profile && data.context.profile.speechtext)	sttTts.startTTS(data.context.profile.speechtext);
			}
			scrollToBottom();
		});
	};


	this.receiveUserImage = function(){
		stopExampleTimer();
		this.dialog_history.push({text: null, speaker: "user", textType: true});
	};

	this.user_text = "";
	this.input_example = "";
	this.dialog_history = [];
	conversation.start(function(e, data){
		if(e){
			self.dialog_history.push({text: "エラーが発生しました", speaker: "watson", textType: true });
		}else{
			updateContext(data.context);
			self.dialog_history.push({text: data.output.text, speaker: "watson", textType: true });
			if(data.context && data.context.profile && data.context.profile.speechtext)	sttTts.startTTS(data.context.profile.speechtext);
		}
	});

	this.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];

	this.startSTT = function() {
		sttTts.startSTT(function(err, startSTTText) {
			if (err) {return console.log(err);}
			console.log(startSTTText);
			self.user_text = startSTTText;
			self.receiveUserText();
		});
	};

	this.startVR = function() {
		console.log('start VR controller');

		//画像プレビュー

		$scope.srcUrl = undefined;
		//画像ファイルじゃなければ何もしない
		if(!file || !file.type.match("image.*")){
				return;
		}
		//new FileReader API
		var reader = new FileReader();
		//callback
		reader.onload = function(){
				$scope.$apply(function(){
						$scope.srcUrl = reader.result;
				});
		};
		//read as url(reader.result = url)
		reader.readAsDataURL(file)

		//画像プレビュー


		self.receiveUserImage();

		//formdata
		var fd = new FormData();
		fd.append('file',$('input[type=file]')[0].files[0]);

		//post
		// TODO api_keyを初回起動時にBluemixの設定から取りに行く
		$http.post('https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/classify?api_key=baaae9310c92f4fabc9f24cd3fb7eaef809087d5&version=2016-05-20',fd,{
				transformRequest: null,
				headers: {'Content-type':undefined}
		})
		.success(function(res){
				var txt = res.images[0].classifiers[0].classes[0].class;
				self.user_text = txt;
				self.receiveUserText();
		});
	};
	// Modal 呼び出し サンプル　showModal($scope, $uibModal, modalHeader, modalMessage, modalFooter, DialogCtrl)
	// showModal($scope, $uibModal, "機会番号の読み取り",
	// "<div align=\"left\">専用バーコードで、機械番号を読み取ってください。</div></LEFT><CENTER><img src=\"images/watson_think.gif\" width=\"100\" height=\"100\"><BR>読み取り中</CENTER>",
	// "","a", self);

	// Modal 呼び出し Function
	function showModal($scope, $uibModal, modalHeader, modalMessage, modalFooter, nextMessage, DialogCtrl_temp) {
		var modalInstance = $uibModal.open({
			templateUrl: 'views/conversationModal.html',
			controller: 'ModalController',
			backdrop: true,
			scope: $scope,
			resolve: {
				params:function(){
					return {
						modalHeader: modalHeader,
						modalMessage: modalMessage,
						modalFooter: modalFooter,
						DialogCtrl: DialogCtrl_temp,
						nextMessage: nextMessage
					};
				}
			}
		});
		//set callback
		modalInstance.result.then(
			function(result){
				$scope.result = result;
				$scope.event = "close";
			},
			function(result){
				$scope.result = result;
				$scope.event = "dismiss";
			}
		);
	}

}]);

angular.module('clientApp').directive("fileModel", ["$parse", function ($parse) {
		console.log("start directive");
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            element.bind("change", function () {
                scope.$apply(function () {
                    model.assign(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

angular.module('clientApp').controller('ModalController', ['$scope', '$uibModalInstance',　'params', '$timeout',
function($scope, $uibModalInstance, params, $timeout){
	$scope.modalHeader = params.modalHeader;
	$scope.modalMessage = params.modalMessage;
	$scope.modalFooter = params.modalFooter;
	$scope.nextMessage = params.nextMessage;
	$scope.pressClose = function(){
		$uibModalInstance.close('done');
	};
	$scope.pressDismiss = function(){
		$uibModalInstance.dismiss('done');
	};

	$timeout(function() {
		$uibModalInstance.close('done');
		console.log(params.DialogCtrl);
		params.DialogCtrl.user_text = $scope.nextMessage;
		params.DialogCtrl.receiveUserText();
	},8000);

}]);
