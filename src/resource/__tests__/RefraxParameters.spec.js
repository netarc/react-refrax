/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxParameters = require('RefraxParameters');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxParameters', function() {
  describe('instantiation', function() {
    it('should throw an error on invalid params', function() {
      expect(function() {
        new RefraxParameters(123);
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

      expect(function() {
        new RefraxParameters('bar');
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

      expect(function() {
        new RefraxParameters(function() {});
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

      expect(function() {
        new RefraxParameters({}, 123);
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

      expect(function() {
        new RefraxParameters({}, 'bar');
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

      expect(function() {
        new RefraxParameters({}, function() {});
      }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');
    });

    it('should accept no arguments', function() {
      var result = new RefraxParameters();

      expect(result)
        .that.is.an.instanceof(RefraxParameters)
        .to.deep.equal({});
    });

    it('should accept correct arguments and look like a RefraxParameters', function() {
      var result = new RefraxParameters({ 'foo': 'bar' }, { 'baz': 123 });

      expect(result)
        .that.is.an.instanceof(RefraxParameters)
        .to.deep.equal({
          'foo': 'bar',
          'baz': 123
        });
    });

    it('should accept another RefraxParameters instance', function() {
      var result = new RefraxParameters(new RefraxParameters({ 'foo': 'bar' }));

      expect(result)
        .that.is.an.instanceof(RefraxParameters)
        .to.deep.equal({
          'foo': 'bar'
        });
    });
  });
});
