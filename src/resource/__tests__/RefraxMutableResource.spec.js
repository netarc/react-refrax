/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';
import RefraxResource from 'RefraxResource';
import RefraxMutableResource from 'RefraxMutableResource';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxQueryParameters from 'RefraxQueryParameters';
import RefraxSchemaPath from 'RefraxSchemaPath';
import RefraxSchema from 'RefraxSchema';
import RefraxFragmentResult from 'RefraxFragmentResult';
import RefraxConstants from 'RefraxConstants';
import createSchemaCollection from 'createSchemaCollection';

const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_DELETE = RefraxConstants.action.delete;
const ACTION_UPDATE = RefraxConstants.action.update;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const STATUS_COMPLETE = RefraxConstants.status.complete;
const STATUS_STALE = RefraxConstants.status.stale;
const STRATEGY_MERGE = RefraxConstants.strategy.merge;
const STRATEGY_REPLACE = RefraxConstants.strategy.replace;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;

const dataElement1 = { id: 1, name: 'foo bob' };
const dataElement2 = { id: 2, name: 'foo baz' };
const dataCollectionUsers1 = [
  dataElement1,
  dataElement2
];

/* eslint-disable no-new, indent */
/* global mock_get mock_post mock_put mock_reset mock_delete */
/* global delay_for_resource_request */
describe('RefraxMutableResource', () => {
  let schema;

  beforeEach(() => {
    schema = new RefraxSchema();

    schema.addLeaf(createSchemaCollection('users'));
  });

  describe('instantiation', () => {
    it('should require a valid accessor', () => {
      expect(() => {
        new RefraxMutableResource();
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxMutableResource(123);
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxMutableResource('foo');
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxMutableResource({foo: 'bar'});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxMutableResource(() => {});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxMutableResource(schema.users);
      }).to.not.throw(Error);
    });

    it('should look like a ResourceBase', () => {
      var mutableUsers = new RefraxMutableResource(schema.users);

      expect(mutableUsers)
        .to.be.instanceof(RefraxMutableResource);
      expect(mutableUsers)
        .to.have.property('_schemaPath')
          .that.is.an.instanceof(RefraxSchemaPath);
      expect(mutableUsers)
        .to.have.property('_paths')
          .that.is.an.instanceof(Array);
      expect(mutableUsers)
        .to.have.property('_options')
          .that.is.an.instanceof(RefraxOptions);
      expect(mutableUsers)
        .to.have.property('_parameters')
          .that.is.an.instanceof(RefraxParameters);
      expect(mutableUsers)
        .to.have.property('_queryParams')
          .that.is.an.instanceof(RefraxQueryParameters);
    });
  });

  describe('methods', () => {
    let schema;

    beforeEach(() => {
      mock_reset();

      schema = new RefraxSchema();
      schema.addLeaf(createSchemaCollection('users'));
    });

    describe('create', () => {
      const sentData = { name: 'foo joe' };
      const responseData = { id: 1, name: 'foo joe' };
      const expectedDescriptor = {
        action: ACTION_CREATE,
        basePath: '/users',
        cacheStrategy: STRATEGY_REPLACE,
        classify: CLASSIFY_COLLECTION,
        collectionStrategy: STRATEGY_MERGE,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        payload: sentData,
        type: 'user',
        valid: true
      };
      let mutableUsers, store;

      beforeEach(() => {
        mutableUsers = new RefraxMutableResource(schema.users);
        store = schema.__node.definition.storeMap.getOrCreate('user');
        expectedDescriptor.store = store;

        sinon.spy(mutableUsers, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_post('/users', responseData);
      });

      it('returns a promise', () => {
        const result = mutableUsers.create(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return mutableUsers
          .create(sentData)
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([responseData]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(store.destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles a void hook', () => {
        return mutableUsers
          .create(sentData, (data, response, descriptor) => {
            expect(data).to.deep.equal(responseData);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([responseData]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(store.destroyResource.callCount).to.equal(0);
          });
      });

      it('correctly handles return value from a hook', () => {
        return mutableUsers
          .create(sentData, (data, response, descriptor) => {
            return {
              id: data.id,
              name: data.name.toUpperCase()
            };
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([{ id: 1, name: 'FOO JOE' }]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal({
              id: responseData.id,
              name: responseData.name.toUpperCase()
            });
            expect(store.destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });
    });

    describe('destroy', () => {
      const sentData = { name: 'foo joe' };
      const responseData = { id: 1, name: 'foo joe' };
      const expectedDescriptor = {
        action: ACTION_DELETE,
        basePath: '/users',
        cacheStrategy: STRATEGY_REPLACE,
        classify: CLASSIFY_COLLECTION,
        collectionStrategy: STRATEGY_REPLACE,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        payload: sentData,
        type: 'user',
        valid: true
      };
      let mutableUsers, store;

      beforeEach(() => {
        mutableUsers = new RefraxMutableResource(schema.users);
        store = expectedDescriptor.store = schema.__node.definition.storeMap.getOrCreate('user');

        sinon.spy(mutableUsers, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_delete('/users', responseData);
      });

      it('returns a promise', () => {
        const result = mutableUsers.destroy(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return mutableUsers
          .destroy(sentData)
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.equal(null);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles a void hook', () => {
        return mutableUsers
          .destroy(sentData, (data, response, descriptor) => {
            expect(data).to.deep.equal(responseData);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.equal(null);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles return value from a hook', () => {
        return mutableUsers
          .destroy(sentData, (data, response, descriptor) => {
            return {
              id: data.id,
              name: data.name.toUpperCase()
            };
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.equal(null);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });
    });

    describe('update', () => {
      const sentData = { name: 'foo joe' };
      const responseData = { id: 1, name: 'foo joe' };
      const expectedDescriptor = {
        action: ACTION_UPDATE,
        basePath: '/users',
        cacheStrategy: STRATEGY_REPLACE,
        classify: CLASSIFY_COLLECTION,
        collectionStrategy: STRATEGY_REPLACE,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        payload: sentData,
        type: 'user',
        valid: true
      };
      let mutableUsers, store;

      beforeEach(() => {
        mutableUsers = new RefraxMutableResource(schema.users);
        store = expectedDescriptor.store = schema.__node.definition.storeMap.getOrCreate('user');

        sinon.spy(mutableUsers, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_put('/users', responseData);
      });

      it('returns a promise', () => {
        const result = mutableUsers.update(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return mutableUsers
          .update(sentData)
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([responseData]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(store.destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles a void hook', () => {
        return mutableUsers
          .update(sentData, (data, response, descriptor) => {
            expect(data).to.deep.equal(responseData);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([responseData]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(store.destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles return value from a hook', () => {
        return mutableUsers
          .update(sentData, (data, response, descriptor) => {
            return {
              id: data.id,
              name: data.name.toUpperCase()
            };
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal([{ id: 1, name: 'FOO JOE' }]);
            expect(response).to.have.all.keys([
              'code',
              'config',
              'data',
              'headers',
              'request',
              'status',
              'statusText'
            ]);
            expect(descriptor).to.equal(store.touchResource.getCall(0).args[0]);

            // hooks
            expect(mutableUsers._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal({
              id: responseData.id,
              name: responseData.name.toUpperCase()
            });
            expect(store.destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });
    });
  });

  describe('behaviors', () => {
    beforeEach(() => {
      mock_reset();
    });

    describe('item', () => {
      it('properly updates collections when mutated', () => {
        mock_get('/users', dataCollectionUsers1);

        var resourceUsers = new RefraxResource(schema.users)
          , mutableUser = new RefraxMutableResource(schema.users.user.withParams({
          userId: 1
        }));

        expect(resourceUsers).to.deep.match({
          data: null,
          status: STATUS_STALE,
          timestamp: TIMESTAMP_LOADING
        });

        return delay_for_resource_request(resourceUsers)()
          .then(() => {
            expect(resourceUsers).to.deep.match({
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            });

            mock_put('/users/1', { id: 1, name: 'bob foo' });
            const promiseUpdate = mutableUser.update({ name: 'bob foo' });

            // The `touch` event from our `update` does not affect the collection
            expect(resourceUsers).to.deep.match({
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            });

            return promiseUpdate;
          })
          .then(() => {
            // The `update` event from our `update` action should update the collection
            expect(resourceUsers).to.deep.match({
              data: [
                { id: 1, name: 'bob foo' },
                dataElement2
              ],
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            });
          });
      });
    });
  });
});
