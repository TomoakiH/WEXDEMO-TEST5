'use strict';

/**
 * @ngdoc service
 * @name clientApp.vr
 * @description
 * # vr
 * Service in the clientApp.
 */
angular.module('clientApp')
  .factory('vr', function ($resource) {
    //　この内容は呼ばれない
    // console.log('start service VR');
    return {
      startVR: function(){
        // console.log('start VR in function');

        // var Result = $resource({
        $resource({
          method: 'POST',
    			// url: 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify',
    			url: 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key={baaae9310c92f4fabc9f24cd3fb7eaef809087d5}&version=2016-05-20',
    			headers: {'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'},
    			// data: { api_key: 'baaae9310c92f4fabc9f24cd3fb7eaef809087d5', version: '2016-05-20' }
    			file: 'images.jpg'
    		})
        // console.log("Result = ");
        // console.log(Result);

    		// .success(function(res){
    			// $scope.result = data;
    		// 	console.log('nomal end');
    		// 	console.log(res);
    		// })
        // ;
        // console.log(Result);
    		// .error(function(){
    		// 	// $scope.result = '通信失敗！';
    		// 	console.log('abnormal end');
    		// });
        // var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
        // var fs = require('fs');
        //
        // var visual_recognition = new VisualRecognitionV3({
        //   api_key: 'baaae9310c92f4fabc9f24cd3fb7eaef809087d5',
        //   version_date: VisualRecognitionV3.VERSION_DATE_2016_05_20
        // });
        //
        // var params = {
        //   images_file: fs.createReadStream('./images.jpg')
        // };
        //
        // visual_recognition.classify(params, function(err, res) {
        //   if (err){
        //     console.log(err);
        //   }else{
        //     console.log(JSON.stringify(res, null, 2));
        //   }
        // });

      }
      // },
      // startVR: function(startSTTCallback) {
      //   sttToAsk(function(err, sttToAskText) {
      //     console.log(err);
      //     console.log(sttToAskText);
      //     startSTTCallback(err, sttToAskText);
      //   });
      // }
    };
  });
