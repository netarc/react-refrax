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
const createSchemaCollection = require('createSchemaCollection');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const expect = chai.expect;


/* eslint-disable no-new */
describe('createSchemaCollection', function() {
  afterEach(TestHelper.deleteStores);

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

        expect(collectionUsers.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'user'
          });

        expect(collectionUsers.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .that.deep.equals({
            type: CLASSIFY_COLLECTION,
            definition: {
              uri: 'users'
            }
          });

        expect(collectionUsers)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'users');
        expect(collectionUsers).to.have.property('user')
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'user');
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

        expect(collectionUsers.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'foo_user'
          });

        expect(collectionUsers.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .that.deep.equals({
            type: CLASSIFY_COLLECTION,
            definition: {
              uri: 'users'
            }
          });

        expect(collectionUsers)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'users');
        expect(collectionUsers).to.have.property('user')
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'user');
      });

      it('should use a store instance', function() {
        var collectionUsers = createSchemaCollection('users', RefraxStore.get('foo_user'));

        expect(collectionUsers.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxStore)
          .to.have.property('definition')
          .that.deep.equals({
            type: 'foo_user'
          });

        expect(collectionUsers.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .that.deep.equals({
            type: CLASSIFY_COLLECTION,
            definition: {
              uri: 'users'
            }
          });

        expect(collectionUsers)
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'users');
        expect(collectionUsers).to.have.property('user')
          .that.is.an.instanceof(RefraxSchemaPath)
          .to.have.property('__node')
            .that.is.instanceof(RefraxSchemaNode)
            .to.have.property('identifier', 'user');
      });
    });

    describe('with an options argument', function() {
      it('should allow to change the identifier used', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
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

      it('should pass options to collection', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
          collection: {
            partial: 'bar'
          }
        });

        expect(collectionUsers.__node.subject).with.deep.property('[1]')
          .that.is.an.instanceof(RefraxTreeNode)
          .that.deep.equals({
            type: CLASSIFY_COLLECTION,
            definition: {
              uri: 'users',
              partial: 'bar'
            }
          });
      });

      it('should pass options to member', function() {
        var collectionUsers = createSchemaCollection('users', 'user', {
          member: {
            partial: 'bar'
          }
        });

        expect(collectionUsers.user.__node.subject).with.deep.property('[0]')
          .that.is.an.instanceof(RefraxTreeNode)
          .that.deep.equals({
            type: CLASSIFY_ITEM,
            definition: {
              paramId: 'userId',
              partial: 'bar'
            }
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
