/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxOptions = require('RefraxOptions');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxOptions', function() {
  describe('instantiation', function() {
    it('should throw an error on invalid params', function() {
      expect(function() {
        new RefraxOptions(123);
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

      expect(function() {
        new RefraxOptions('bar');
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

      expect(function() {
        new RefraxOptions(function() {});
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

      expect(function() {
        new RefraxOptions({}, 123);
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

      expect(function() {
        new RefraxOptions({}, 'bar');
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

      expect(function() {
        new RefraxOptions({}, function() {});
      }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');
    });

    it('should accept no arguments', function() {
      var result = new RefraxOptions();

      expect(result)
        .that.is.an.instanceof(RefraxOptions)
        .to.deep.equal({});
    });

    it('should accept correct arguments and look like a RefraxOptions', function() {
      var result = new RefraxOptions({ 'foo': 'bar' }, { 'baz': 123 });

      expect(result)
        .that.is.an.instanceof(RefraxOptions)
        .to.deep.equal({
          'foo': 'bar',
          'baz': 123
        });
    });
  });
});
