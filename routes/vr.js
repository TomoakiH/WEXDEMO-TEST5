'use strict';

exports.vr = function(req, res) {

  var multer = require("multer");
  var upload = multer({dest: "./tmp"});

  console.log("start VR");
  // console.log(req.body.file);
  // console.log(req);
  console.log(req.body);
  // console.log(req.body.file);
  // console.log(req.body.filename);
  // for(r of req) {
  //   console.log(r);
  // }
  upload.single("file"),function(req,res,next){
      console.log(req.file);
  //req.fileにアップロードされたデータの情報が格納される。
  //req.bodyにはテキストデータが格納される。
  }
  // var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
  // var fs = require('fs');
  //
  // var visual_recognition = new VisualRecognitionV3({
  //   api_key: 'baaae9310c92f4fabc9f24cd3fb7eaef809087d5',
  //   // version_date: VisualRecognitionV3.VERSION_DATE_2016_05_20
  //   version_date: '2016-05-20'
  //
  // });
  //
  // var params = {
  //   images_file: fs.createReadStream('./images.jpg')
  // };
  //
  // visual_recognition.classify(params, function(err, res) {
  //   if(err){
  //     console.log(err);
  //   }else{
  //     console.log(JSON.stringify(res, null, 2));
  //     res.send(JSON.stringify(res, null, 2));
  //   }
  // });
}
