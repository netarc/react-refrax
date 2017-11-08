/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { createSchemaCollection } from 'schema/createSchemaCollection';
import { SchemaNode } from 'schema/node';
import { SchemaPath } from 'schema/path';
import { Store } from 'store/store';
import { IClassification } from 'util/types';

// tslint:disable no-magic-numbers no-empty

describe('schema/createSchemaCollection', () => {
  describe('invocation', () => {
    describe('with no arguments', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          createSchemaCollection();
        }).to.throw(Error, 'expected string path identifier but found `undefined`');
      });
    });

    describe('with a path argument', () => {
      it('should throw an error when invalid', () => {
        expect(() => {
          // @ts-ignore
          createSchemaCollection(123);
        }).to.throw(Error, 'expected string path identifier but found `123`');

        expect(() => {
          // @ts-ignore
          createSchemaCollection(() => {});
        }).to.throw(Error, 'expected string path identifier but found `function () {}`');

        expect(() => {
          // @ts-ignore
          createSchemaCollection({ foo: 123 });
        }).to.throw(Error, 'expected string path identifier but found `[object Object]`');
      });

      it('should use a default store based off the path in singular form', () => {
        const collectionUsers = createSchemaCollection('users');

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'userId'
            });
      });
    });

    describe('with a store argument', () => {
      it('should throw an error when invalid', () => {
        expect(() => {
          createSchemaCollection('users', { store: 123 });
        }).to.throw(Error, 'A valid store reference');

        expect(() => {
          createSchemaCollection('users', { store: () => {} });
        }).to.throw(Error, 'A valid store reference');
      });

      it('should use a specified string for a store type', () => {
        const collectionUsers = createSchemaCollection('users', { store: 'foo_user' });

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store: 'foo_user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'userId'
            });
      });

      it('should use a store instance', () => {
        const store = new Store('foo_user');
        const collectionUsers = createSchemaCollection('users', { store });

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store,
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'userId'
            });
      });
    });

    describe('with an options argument', () => {
      it('should allow to change the identifier used', () => {
        const collectionUsers = createSchemaCollection('users', {
          store: 'user',
          identifier: 'clients'
        });

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'clients');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('client')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.client.__node)
          .to.have.property('identifier', 'client');
        expect(collectionUsers.client.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'clientId'
            });
      });

      it('should pass options to collection', () => {
        const collectionUsers = createSchemaCollection('users', {
          store: 'user',
          collection: {
            partial: 'bar'
          }
        });

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store: 'user',
              path: 'users',
              partial: 'bar'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'userId'
            });
      });

      it('should pass options to member', () => {
        const collectionUsers = createSchemaCollection('users', {
          store: 'user',
          member: {
            partial: 'bar'
          }
        });

        expect(collectionUsers)
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.collection,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.item,
              paramId: 'userId',
              partial: 'bar'
            });
      });

      it('should accept an options argument as the second', () => {
        const collectionUsers = createSchemaCollection('users', {
          identifier: 'clients'
        });

        expect(collectionUsers)
          .that.is.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode)
            .to.have.property('identifier', 'clients');
        expect(collectionUsers).to.have.property('client')
          .that.is.an.instanceof(SchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode)
            .to.have.property('identifier', 'client');
      });
    });
  });
});
