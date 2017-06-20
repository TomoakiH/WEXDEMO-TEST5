'use strict';

describe('Service: sttTts', function () {

  // load the service's module
  beforeEach(module('clientApp'));

  // instantiate service
  var sttTts;
  beforeEach(inject(function (_sttTts_) {
    sttTts = _sttTts_;
  }));

  it('should do something', function () {
    expect(!!sttTts).toBe(true);
  });

});
