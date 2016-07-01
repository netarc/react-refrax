/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxSchemaNodeAccessor = require('RefraxSchemaNodeAccessor');
const RefraxSchemaNode = require('RefraxSchemaNode');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxSchemaNodeAccessor', function() {
  describe('instantiation', function() {
    it('should throw an error when passed invalid arguments', function() {
      expect(function() {
        new RefraxSchemaNodeAccessor();
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaNodeAccessor(123);
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaNodeAccessor('foo');
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(function() {
        new RefraxSchemaNodeAccessor({bar: 23});
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');
    });

    it('should not throw an error when passed valid arguments', function() {
      expect(function() {
        new RefraxSchemaNodeAccessor(new RefraxSchemaNode());
      }).to.not.throw(Error);
    });

    it('should look like a node accessor', function() {
      var rootAccessor = new RefraxSchemaNodeAccessor(new RefraxSchemaNode({
        foo: 213
      }));

      expect(rootAccessor).to.have.property('__node')
        .that.is.an.instanceof(RefraxSchemaNode)
        .to.have.property('subject')
          .that.is.an.instanceof(Array)
          .that.deep.equals([{foo: 213}]);
    });
  });

  describe('methods', function() {
    describe('addLeaf', function() {
      it('should only accept a leaf object optionally preceeded by an identifier', function() {
        var nodeAccessor = new RefraxSchemaNodeAccessor(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode(123);

        expect(function() {
          nodeAccessor.addLeaf(123);
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaNodeAccessor or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf('abc');
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaNodeAccessor or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf('abc', {});
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaNodeAccessor or RefraxSchemaNode');

        expect(function() {
          nodeAccessor.addLeaf(schemaNode);
        }).to.throw(Error, 'Failed to add leaf with no inherit identifier');
      });

      it('should not throw an error on valid arguments', function() {
        var nodeAccessor = new RefraxSchemaNodeAccessor(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode(123)
          , schemaNodeWithLiteral = new RefraxSchemaNode(123, 'foo');

        expect(function() {
          nodeAccessor.addLeaf('bar', schemaNode);
          nodeAccessor.addLeaf(schemaNodeWithLiteral);
        }).to.not.throw(Error);
      });

      it('should correctly add an accessible leaf', function() {
        var rootAccessor = new RefraxSchemaNodeAccessor(new RefraxSchemaNode())
          , schemaNode1 = new RefraxSchemaNode(123)
          , schemaNode2 = new RefraxSchemaNode(321);

        rootAccessor.addLeaf('foo', schemaNode1);
        expect(rootAccessor).to.have.property('foo')
          .that.is.an.instanceof(RefraxSchemaNodeAccessor);
        expect(rootAccessor.foo.__node).to.equal(schemaNode1);

        rootAccessor.foo.addLeaf('bar', schemaNode2);
        expect(rootAccessor).to.not.have.property('bar');
        expect(rootAccessor.foo).to.have.property('bar')
          .that.is.an.instanceof(RefraxSchemaNodeAccessor);
        expect(rootAccessor.foo.bar.__node).to.equal(schemaNode2);

        expect(rootAccessor.foo.bar).to.not.have.property('foo');
      });
    });
  });
});
