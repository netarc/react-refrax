/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxQueryParameters = require('RefraxQueryParameters');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxQueryParameters', function() {
  describe('instantiation', function() {
    it('should throw an error on invalid params', function() {
      expect(function() {
        new RefraxQueryParameters(123);
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

      expect(function() {
        new RefraxQueryParameters('bar');
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

      expect(function() {
        new RefraxQueryParameters(function() {});
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

      expect(function() {
        new RefraxQueryParameters({}, 123);
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

      expect(function() {
        new RefraxQueryParameters({}, 'bar');
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

      expect(function() {
        new RefraxQueryParameters({}, function() {});
      }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');
    });

    it('should accept no arguments', function() {
      var result = new RefraxQueryParameters();

      expect(result)
        .that.is.an.instanceof(RefraxQueryParameters)
        .to.deep.equal({});
    });

    it('should accept correct arguments and look like a RefraxQueryParameters', function() {
      var result = new RefraxQueryParameters({ 'foo': 'bar' }, { 'baz': 123 });

      expect(result)
        .that.is.an.instanceof(RefraxQueryParameters)
        .to.deep.equal({
          'foo': 'bar',
          'baz': 123
        });
    });
  });
});
