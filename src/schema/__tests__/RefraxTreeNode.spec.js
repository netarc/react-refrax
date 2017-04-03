/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxTreeNode = require('RefraxTreeNode');
const expect = chai.expect;
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;



/* eslint-disable no-new */
describe('RefraxTreeNode', function() {
  describe('instantiation', function() {
    it('should only accept object params type', function() {
      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, 123);
      }).to.throw(Error, 'pass an invalid definition of type');

      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, 'abc');
      }).to.throw(Error, 'pass an invalid definition of type');
    });

    it('should throw an error with an invalid option', function() {
      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, {barfoo: 123});
      }).to.throw(Error, 'Invalid definition option');
    });

    it('should throw an error on invalid option values', function() {
      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, {partial: 123});
      }).to.throw(Error);

      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, {fragments: 123});
      }).to.throw(Error);

      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, {uri: 123});
      }).to.throw(Error);
    });

    it('should not throw an error on valid option values', function() {
      expect(function() {
        new RefraxTreeNode(CLASSIFY_RESOURCE, {uri: '/foo'});
        new RefraxTreeNode(CLASSIFY_RESOURCE, {partial: 'minimal'});
        new RefraxTreeNode(CLASSIFY_RESOURCE, {paramId: 'fooId'});
        new RefraxTreeNode(CLASSIFY_RESOURCE, {fragments: ['default', 'full']});
      }).to.not.throw(Error);
    });
  });

  describe('methods', function() {
  });
});
