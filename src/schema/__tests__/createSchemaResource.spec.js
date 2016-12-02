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
const RefraxStore = require('RefraxStore');
const createSchemaResource = require('createSchemaResource');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;
const expect = chai.expect;


/* eslint-disable no-new */
describe('createSchemaResource', function() {
  afterEach(TestHelper.deleteStores);

  describe('invocation', function() {
    describe('with no arguments', function() {
      it('should throw an error', function() {
        expect(function() {
          createSchemaResource();
        }).to.throw(Error, 'A valid path must be passed');
      });
    });

    describe('with a path argument', function() {
      it('should throw an error when invalid', function() {
        expect(function() {
          createSchemaResource(123);
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaResource(function() {});
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaResource({foo: 123});
        }).to.throw(Error, 'A valid path must be passed');
      });

      it('should use a default store based off the path in singular form', function() {
        var resourceSettings = createSchemaResource('settings');

        expect(resourceSettings.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'setting'
          });

        expect(resourceSettings.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              uri: 'settings'
            });

        expect(resourceSettings)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'settings');
      });
    });

    describe('with a store argument', function() {
      it('should throw an error when invalid', function() {
        expect(function() {
          createSchemaResource('settings', 123);
        }).to.throw(Error, 'A valid store reference');

        expect(function() {
          createSchemaResource('settings', function() {});
        }).to.throw(Error, 'A valid store reference');
      });

      it('should use a specified string for a store type', function() {
        var resourceSettings = createSchemaResource('settings', 'settings_foo');

        expect(resourceSettings.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'settings_foo'
          });

        expect(resourceSettings.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              uri: 'settings'
            });

        expect(resourceSettings)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'settings');
      });

      it('should use a store instance', function() {
        var resourceSettings = createSchemaResource('settings', RefraxStore.get('settings_foo'));

        expect(resourceSettings.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'settings_foo'
          });

        expect(resourceSettings.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              uri: 'settings'
            });

        expect(resourceSettings)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'settings');
      });
    });

    describe('with an options argument', function() {
      it('should allow to change the identifier used', function() {
        var resourceSettings = createSchemaResource('settings', 'user', {
          identifier: 'clients'
        });

        expect(resourceSettings)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'clients');
      });

      it('should pass options to resource', function() {
        var resourceSettings = createSchemaResource('settings', 'user', {
          resource: {
            partial: 'bar'
          }
        });

        expect(resourceSettings.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              uri: 'settings',
              partial: 'bar'
            });
      });

      it('should accept an options argument as the second', function() {
        var resourceSettings = createSchemaResource('settings', {
          identifier: 'clients'
        });

        expect(resourceSettings)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'clients');
      });
    });
  });
});
