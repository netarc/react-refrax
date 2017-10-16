/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import RefraxSchemaPath from 'RefraxSchemaPath';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxStore from 'RefraxStore';
import createSchemaResource from 'createSchemaResource';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;


/* eslint-disable no-new */
describe('createSchemaResource', function() {
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

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: 'setting',
              path: 'settings'
            });
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

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: 'settings_foo',
              path: 'settings'
            });
      });

      it('should use a store instance', function() {
        var store = new RefraxStore('settings_foo')
          , resourceSettings = createSchemaResource('settings', store);

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: store,
              path: 'settings'
            });
      });
    });

    describe('with an options argument', function() {
      it('should allow to change the identifier used', function() {
        var resourceSettings = createSchemaResource('settings', 'user', {
          identifier: 'clients'
        });

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'clients');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: 'user',
              path: 'settings'
            });
      });

      it('should pass options to resource', function() {
        var resourceSettings = createSchemaResource('settings', 'user', {
          resource: {
            partial: 'bar'
          }
        });

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: 'user',
              path: 'settings',
              partial: 'bar'
            });
      });

      it('should accept an options argument as the second', function() {
        var resourceSettings = createSchemaResource('settings', {
          identifier: 'clients'
        });

        expect(resourceSettings)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'clients');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_RESOURCE,
              store: 'client',
              path: 'settings'
            });
      });
    });
  });
});
