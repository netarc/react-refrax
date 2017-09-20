/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxPath = require('RefraxPath');
const expect = chai.expect;


/* eslint-disable no-new, indent */
describe('RefraxPath', function() {
  describe('instantiation', function() {
    it('should throw an error on invalid path', function() {
      expect(function() {
        new RefraxPath(123);
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');

      expect(function() {
        new RefraxPath({foo: 'bar'});
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');

      expect(function() {
        new RefraxPath(function() {});
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');
    });

    it('should accept correct arguments and look like a RefraxPath', function() {
      var result = new RefraxPath('/users', true);

      expect(result)
        .that.is.an.instanceof(RefraxPath)
        .to.have.property('path');
      expect(result)
        .to.have.property('isModifier');
    });

    it('should properly clean path argument', function() {
      expect(new RefraxPath('/ users ', true).path).to.equal('users');
      expect(new RefraxPath(' /users', true).path).to.equal('users');
    });

    it('should properly represent modifier argument', function() {
      expect(new RefraxPath('users ', true).isModifier).to.equal(true);
      expect(new RefraxPath('users', false).isModifier).to.equal(false);
      expect(new RefraxPath('users', 123).isModifier).to.equal(true);
      expect(new RefraxPath('users', 'foo').isModifier).to.equal(true);
      expect(new RefraxPath('users', {foo: 'bar'}).isModifier).to.equal(true);
    });
  });
});
