/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const TestHelper = require('TestHelper');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxTreeNode = require('RefraxTreeNode');
const createSchemaNamespace = require('createSchemaNamespace');
const expect = chai.expect;


/* eslint-disable no-new */
describe('createSchemaNamespace', function() {
  afterEach(TestHelper.deleteStores);

  describe('invocation', function() {
    describe('with no arguments', function() {
      it('should throw an error', function() {
        expect(function() {
          createSchemaNamespace();
        }).to.throw(Error, 'A valid path must be passed');
      });
    });

    describe('with a path argument', function() {
      it('should throw an error when invalid', function() {
        expect(function() {
          createSchemaNamespace(123);
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaNamespace(function() {});
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaNamespace({foo: 123});
        }).to.throw(Error, 'A valid path must be passed');
      });

      it('should look like a valid namespace', function() {
        var namespaceAPI = createSchemaNamespace('api');

        expect(namespaceAPI)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'api');

        expect(namespaceAPI.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              uri: 'api'
            });
      });
    });

    describe('with an options argument', function() {
      it('should pass options to namespace', function() {
        var namespaceAPI = createSchemaNamespace('api', {
          namespace: {
            partial: 'bar'
          }
        });

        expect(namespaceAPI.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              uri: 'api',
              partial: 'bar'
            });
      });
    });
  });
});
