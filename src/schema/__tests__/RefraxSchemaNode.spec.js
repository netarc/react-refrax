/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxSchemaNode = require('RefraxSchemaNode');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxSchemaNode', function() {
  describe('instantiation', function() {
    it('should throw an error on invalid arguments', function() {
      expect(function() {
        new RefraxSchemaNode({partial: 123}, 321);
      }).to.throw(Error, 'A literal argument can only be of type');

      expect(function() {
        new RefraxSchemaNode({fragments: 123}, {foo: 321});
      }).to.throw(Error, 'A literal argument can only be of type');
    });

    it('should not throw an error on valid option values', function() {
      expect(function() {
        new RefraxSchemaNode({foo: 'bar'});
        new RefraxSchemaNode(123);
        new RefraxSchemaNode('test');
        new RefraxSchemaNode(() => {});
        new RefraxSchemaNode({foo: 'bar'}, 'foo');
        new RefraxSchemaNode(123, 'foo');
        new RefraxSchemaNode('test', 'foo');
        new RefraxSchemaNode(() => {}, 'foo');
      }).to.not.throw(Error);
    });
  });

  describe('methods', function() {
  });
});
