/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { createSchemaResource } from 'schema/createSchemaResource';
import { SchemaNode } from 'schema/node';
import { SchemaPath } from 'schema/path';
import { Store } from 'store/store';
import { IClassification } from 'util/types';

// tslint:disable no-magic-numbers no-empty

describe('schema/createSchemaResource', () => {
  describe('invocation', () => {
    describe('with no arguments', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          createSchemaResource();
        }).to.throw(Error, 'expected string path identifier but found `undefined`');
      });
    });

    describe('with a path argument', () => {
      it('should throw an error when invalid', () => {
        expect(() => {
          // @ts-ignore
          createSchemaResource(123);
        }).to.throw(Error, 'expected string path identifier but found `123`');

        expect(() => {
          // @ts-ignore
          createSchemaResource(() => {});
        }).to.throw(Error, 'expected string path identifier but found `function () {}`');

        expect(() => {
          // @ts-ignore
          createSchemaResource({ foo: 123 });
        }).to.throw(Error, 'expected string path identifier but found `[object Object]`');
      });

      it('should use a default store based off the path in singular form', () => {
        const resourceSettings = createSchemaResource('settings');

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store: 'setting',
              path: 'settings'
            });
      });
    });

    describe('with a store argument', () => {
      it('should throw an error when invalid', () => {
        expect(() => {
          // @ts-ignore
          createSchemaResource('settings', { store: 123 });
        }).to.throw(Error, 'A valid store reference');

        expect(() => {
          createSchemaResource('settings', { store: () => {} });
        }).to.throw(Error, 'A valid store reference');
      });

      it('should use a specified string for a store type', () => {
        const resourceSettings = createSchemaResource('settings', { store: 'settings_foo' });

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store: 'settings_foo',
              path: 'settings'
            });
      });

      it('should use a store instance', () => {
        const store = new Store('settings_foo');
        const resourceSettings = createSchemaResource('settings', { store });

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store,
              path: 'settings'
            });
      });
    });

    describe('with an options argument', () => {
      it('should allow to change the identifier used', () => {
        const resourceSettings = createSchemaResource('settings', {
          store: 'user',
          identifier: 'clients'
        });

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'clients');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store: 'user',
              path: 'settings'
            });
      });

      it('should pass options to resource', () => {
        const resourceSettings = createSchemaResource('settings', {
          store: 'user',
          resource: {
            partial: 'bar'
          }
        });

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'settings');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store: 'user',
              path: 'settings',
              partial: 'bar'
            });
      });

      it('should accept an options argument as the second', () => {
        const resourceSettings = createSchemaResource('settings', {
          identifier: 'clients'
        });

        expect(resourceSettings)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(resourceSettings.__node)
          .to.have.property('identifier', 'clients');
        expect(resourceSettings.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.resource,
              store: 'client',
              path: 'settings'
            });
      });
    });
  });
});
