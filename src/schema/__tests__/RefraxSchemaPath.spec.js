/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxSchemaPath', function() {
  describe('instantiation', function() {
    it('should throw an error when passed invalid arguments', function() {
      expect(function() {
        new RefraxSchemaPath();
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaPath(123);
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaPath('foo');
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaPath({bar: 23});
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');
    });

    it('should not throw an error when passed valid arguments', function() {
      expect(function() {
        new RefraxSchemaPath(new RefraxSchemaNode());
      }).to.not.throw(Error);
    });
  });

  describe('methods', function() {
    describe('enumerateLeafs', function() {
      it('should only enumerate shallow leafs', function() {
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode()
          , schemaNodeWithLiteral = new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'foo')
          , schemaNodeNested = new RefraxSchemaNode()
          , keys = []
          , accessorNodes = [];

        nodeAccessor.addLeaf('bar', schemaNode);
        nodeAccessor.addLeaf(schemaNodeWithLiteral);
        nodeAccessor.bar.addLeaf('baz', schemaNodeNested);

        nodeAccessor.enumerateLeafs((key, accessor) => {
          keys.push(key);
          accessorNodes.push(accessor.__node);
        });

        expect(keys).to.deep.equal(['bar', 'foo']);
        expect(accessorNodes[0]).to.equal(schemaNode);
        expect(accessorNodes[1]).to.equal(schemaNodeWithLiteral);
      });
    });

    describe('addLeaf', function() {
      it('should only accept a leaf object optionally preceeded by an identifier', function() {
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode();

        expect(function() {
          nodeAccessor.addLeaf(123);
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf('abc');
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf('abc', {});
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf(schemaNode);
        }).to.throw(Error, 'Failed to add leaf with no inherit identifier');
      });

      it('should not throw an error on valid arguments', function() {
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode()
          , schemaNodeWithLiteral = new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'foo');

        expect(function() {
          nodeAccessor.addLeaf('bar', schemaNode);
          nodeAccessor.addLeaf(schemaNodeWithLiteral);
        }).to.not.throw(Error);
      });

      it('should correctly add an accessible leaf', function() {
        var rootAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode1 = new RefraxSchemaNode()
          , schemaNode2 = new RefraxSchemaNode();

        rootAccessor.addLeaf('foo', schemaNode1);
        expect(rootAccessor).to.have.property('foo')
          .that.is.an.instanceof(RefraxSchemaPath);
        expect(rootAccessor.foo.__node).to.equal(schemaNode1);

        rootAccessor.foo.addLeaf('bar', schemaNode2);
        expect(rootAccessor).to.not.have.property('bar');
        expect(rootAccessor.foo).to.have.property('bar')
          .that.is.an.instanceof(RefraxSchemaPath);
        expect(rootAccessor.foo.bar.__node).to.equal(schemaNode2);

        expect(rootAccessor.foo.bar).to.not.have.property('foo');
      });
    });
  });
});
