'use strict';

// TODO メソッド削除　or コントローラーの処理を移管

/**
 * @ngdoc service
 * @name clientApp.sttTts
 * @description
 * # sttTts
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('sttTts', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var stream; // マイクロフォンストリーム
    var stream_timer; // ストリームのタイマー設定
    var stream_timer_value = 30000;
    var tts_audio_Obj = {}; //ttsのaudioオブジェクト。音声再生を中止する際に使用する。watson_STT_TSS/watson_qa内で利用
    var storage = sessionStorage;

    /*****************************************************************************
    Function sttToAsk
    *****************************************************************************/
    // sttを実行し、sttがfinal == trueを認識した段階で、認識した文字列によりWatsonへ質問する
    function sttToAsk(sttToAskCallback) {
      //ttsが再生中の場合、ストップさせる
      if (tts_audio_Obj.src) {
        tts_audio_Obj.pause();
      }

      // $("#QuestionText").val = "";

      //$("#stt_btn").prop("disabled", true);
      // $("#QuestionText").blur();

      try {
        //キャッシュをすでに取得している場合、キャッシュを優先
        if (getCachedToken("stt_token")) {
          console.log(getCachedToken("stt_token"));
          startStream(getCachedToken("stt_token"),function(err, startStreamText) {
            sttToAskCallback(err, startStreamText);
          });
        } else {
          // fetchの場合、URLも含めたフルパスを指定しないと、基本認証付のURLを利用した場合にエラーになる。
          fetch('/api/speech-to-text/token', {
            credentials: 'same-origin'//認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
            // credentials: 'include' //認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
          }).then(function (response) {
            return response.text();
          }).then(function (token) {
            setTokenCache("stt_token", token);
            startStream(token,function(err, startStreamText) {
              sttToAskCallback(err, startStreamText);
            });
          }).catch(function (error) {
            console.log(error);
            sttToAskCallback(error);
          });
        }
      } catch (error) {
        console.error(error);
        sttToAskCallback(error);
      }
    }

    /*****************************************************************************
    Function startStream
    *****************************************************************************/
    // sttのストリームを定義する
    function startStream(token,startStreamCallback) {
      stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
        token: token,
        continuous: false, // false = automatically stop transcription the first time a pause is detected
        objectMode: true,
        model: 'ja-JP_BroadbandModel',
        // outputElement: '#output' // CSS selector or DOM Element
      });

      stream.on('error', function (err) {
        console.log(err);
        startStreamCallback(err);
      });

      stream.on('data', function (data) {
        if (data.final === true) {
          startStreamCallback(null, data.alternatives[0].transcript);
          // hideOverlayMessage();
          //$("#stt_btn").prop("disabled", false);
        }
        // console.log(data);
        // $("#QuestionText").val(data.alternatives[0].transcript);
        console.log("text=" + data.alternatives[0].transcript + " confidence=" + data.alternatives[0].confidence);
      });

      stream.on('end', function () {
        // hideOverlayMessage();
        // $("#QuestionText").focus();
      });

      // showOverlayMessage("マイクに向かって話しかけてください");
    }

    /*****************************************************************************
    Function stopStream
    *****************************************************************************/
    // sttのストリームを停止する
    function stopStream() {
      // stream.stop();
      stream = "";
      console.log("Speech to Text Stopped");
      // hideOverlayMessage();
      // $("#QuestionText").focus();
    }

    /*****************************************************************************
    Function tts
    @param {String} tts_text
    *****************************************************************************/
    //ttsを実行する
    function tts(tts_text) {

      //ttsが再生中の場合、ストップさせる
      if (tts_audio_Obj.src) {
        tts_audio_Obj.pause();
      }

      try {
        if (getCachedToken("tts_token")) {
          tts_audio_Obj = WatsonSpeech.TextToSpeech.synthesize({
            text: tts_text,
            token: getCachedToken("tts_token"),
            voice: 'ja-JP_EmiVoice'
          });
        } else {
          // fetchの場合、URLも含めたフルパスを指定しないと、基本認証付のURLを利用した場合にエラーになる。
          fetch('/api/text-to-speech/token', {
            credentials: 'include'//認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
            // credentials: 'same-origin'//認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
          }).then(function (response) {
            return response.text();
          }).then(function (token) {
            setTokenCache("tts_token", token);
            tts_audio_Obj = WatsonSpeech.TextToSpeech.synthesize({
              text: tts_text,
              token: token,
              voice: 'ja-JP_EmiVoice'
            });

          });
        }
      }
      catch
      (error) {
        console.error(error);
      }
    }

    /*****************************************************************************
    Function initToken
    *****************************************************************************/
    //アプリロード時にsttのトークンを取得する。ttsは最初の挨拶で取得するので暫定でコメントアウト
    function initToken() {
      // fetchの場合、URLも含めたフルパスを指定しないと、基本認証付のURLを利用した場合にエラーになる。
      // console.log(window.location.href);
      // console.log(window.location.href.replace(window.location.pathname,'/'));
      // console.log(window.location.href.replace(window.location.pathname,'/').replace('#',''));
      // console.log(window.location.href.replace(window.location.pathname,'/').replace('#','') + 'api/text-to-speech/token');

      fetch('/api/text-to-speech/token', {
        // credentials: 'include'//認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
        credentials: 'same-origin'//認証情報（Cookie)をFetchに乗せるには、    credentials: 'include'  が必要
      }).then(function (response) {
        return response.text();
      }).then(function (token) {
        console.log('TTS token:');
        console.log(token);
        setTokenCache("tts_token", token);
      });

    }
    initToken();

    /*****************************************************************************
    Function getCachedToken
    @param {String} name キャッシュするトークンの種類の名前(stt_token/tts_token)
    *****************************************************************************/
    //キャッシュしたトークンを取得する
    //トークンのタイムスタンプ、tokenの有効期限は1時間 http://www.ibm.com/watson/developercloud/doc/getting_started/gs-tokens.shtml
    //bufferTime4Tokenでexpireされるまでのバッファ(分)を設定
    function getCachedToken(name) {
      var bufferTime4Token = 3;

      if (storage.getItem(name)) {
        var cachedTimeStamp = parseInt(storage.getItem(name + "_timestamp"));
        var currentTimeStamp = parseInt(Date.now());
        if ((currentTimeStamp < cachedTimeStamp + 60 * (60 - bufferTime4Token ) * 1000)) {
          return storage.getItem(name);
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    /*****************************************************************************
    Function setTokenCache
    @param {String} name キャッシュするトークンの種類の名前(stt_token/tts_token)
    @param {String} token トークンの文字列
    *****************************************************************************/
    function setTokenCache(name, token) {
      storage.setItem(name, token);//キャッシュ
      storage.setItem(name + "_timestamp", Date.now());
    }

    // /*****************************************************************************
    // Function showOverlayMessage
    // @param {String} msg オーバーレイした領域に表示するメッセージ
    // *****************************************************************************/
    // function showOverlayMessage(msg) {
    //   $("#overlayMessage").text(msg);
    //   $("#overlayMessage").show();
    // }
    //
    // /*****************************************************************************
    // Function showOverlayMessage
    // *****************************************************************************/
    // //オーバーレイしたメッセージを非表示にする
    // function hideOverlayMessage() {
    //   $("#overlayMessage").text("");
    //   $("#overlayMessage").hide();
    // }
    //

    // Public API here
    return {
      startTTS: function(stt_text){
        tts(stt_text);
      },
      startSTT: function(startSTTCallback) {
        sttToAsk(function(err, sttToAskText) {
          console.log(err);
          console.log(sttToAskText);
          startSTTCallback(err, sttToAskText);
        });
      }
    };



  });
