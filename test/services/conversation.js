// modules
var assert = require('assert');
var conversation = require('../../services/conversation');

// variables
var context = {};

describe('services/conversation', function(){

  describe('start', function(){

    it('success', function(done){
      conversation.start(function(err, result){
        assert.ifError(err);
        context = result.context;
        done();
      })
    })

  })
  // === start ===

  describe('continue', function(){

    it('success', function(done){
      var text = '自動車業界';
      conversation.continue(text, context, function(err, result){
        assert.ifError(err);
        done();
      })
    })

  })
  // === continue ===

})
