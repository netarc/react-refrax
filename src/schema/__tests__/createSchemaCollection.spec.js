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
import createSchemaCollection from 'createSchemaCollection';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;


/* eslint-disable no-new */
describe('createSchemaCollection', function() {
  describe('invocation', function() {
    describe('with no arguments', function() {
      it('should throw an error', function() {
        expect(function() {
          createSchemaCollection();
        }).to.throw(Error, 'A valid path must be passed');
      });
    });

    describe('with a path argument', function() {
      it('should throw an error when invalid', function() {
        expect(function() {
          createSchemaCollection(123);
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaCollection(function() {});
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          createSchemaCollection({foo: 123});
        }).to.throw(Error, 'A valid path must be passed');
      });

      it('should use a default store based off the path in singular form', function() {
        var collectionUsers = createSchemaCollection('users');

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'userId'
            });
      });
    });

    describe('with a store argument', function() {
      it('should throw an error when invalid', function() {
        expect(function() {
          createSchemaCollection('users', 123);
        }).to.throw(Error, 'A valid store reference');

        expect(function() {
          createSchemaCollection('users', function() {});
        }).to.throw(Error, 'A valid store reference');
      });

      it('should use a specified string for a store type', function() {
        var collectionUsers = createSchemaCollection('users', 'foo_user');

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: 'foo_user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'userId'
            });
      });

      it('should use a store instance', function() {
        var store = new RefraxStore('foo_user')
          , collectionUsers = createSchemaCollection('users', store);

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: store,
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'userId'
            });
      });
    });

    describe('with an options argument', function() {
      it('should allow to change the identifier used', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
          identifier: 'clients'
        });

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'clients');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('client')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.client.__node)
          .to.have.property('identifier', 'client');
        expect(collectionUsers.client.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'clientId'
            });
      });

      it('should pass options to collection', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
          collection: {
            partial: 'bar'
          }
        });

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: 'user',
              path: 'users',
              partial: 'bar'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'userId'
            });
      });

      it('should pass options to member', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
          member: {
            partial: 'bar'
          }
        });

        expect(collectionUsers)
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.__node)
          .to.have.property('identifier', 'users');
        expect(collectionUsers.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_COLLECTION,
              store: 'user',
              path: 'users'
            });

        expect(collectionUsers).to.have.property('user')
          .to.be.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode);
        expect(collectionUsers.user.__node)
          .to.have.property('identifier', 'user');
        expect(collectionUsers.user.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: CLASSIFY_ITEM,
              paramId: 'userId',
              partial: 'bar'
            });
      });

      it('should accept an options argument as the second', function() {
        var collectionUsers = createSchemaCollection('users', {
          identifier: 'clients'
        });

        expect(collectionUsers)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'clients');
        expect(collectionUsers).to.have.property('client')
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'client');
      });
    });
  });
});
