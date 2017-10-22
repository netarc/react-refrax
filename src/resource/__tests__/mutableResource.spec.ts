/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import {
  delay_for_resource_request,
  mock_delete,
  mock_get,
  mock_post,
  mock_put,
  mock_reset
} from 'test/TestSupport';

import { MutableResource } from 'resource/mutableResource';
import { Resource } from 'resource/resource';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { SchemaPath } from 'schema/path';
import { Schema } from 'schema/schema';
import { FragmentResult } from 'store/fragmentResult';
import { Store } from 'store/store';
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from 'util/composableHash';
import RefraxConfig from 'util/config';
import {
  IActionType,
  IClassification,
  IKeyValue,
  IStatus,
  IStrategy,
  ITimestamp,
  TRequestResult
} from 'util/types';

const FRAGMENT_DEFAULT = RefraxConfig.defaultFragment;

const dataElement1 = { id: 1, name: 'foo bob' };
const dataElement2 = { id: 2, name: 'foo baz' };
const dataCollectionUsers1 = [
  dataElement1,
  dataElement2
];

describe('MutableResource', () => {
  describe('instantiation', () => {
    let schema: Schema;

    beforeEach(() => {
      mock_reset();

      schema = new Schema();
      schema.addLeaf(createSchemaCollection('users'));
    });

    it('should require a valid accessor', () => {
      expect(() => {
        // @ts-ignore
        new MutableResource();
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new MutableResource(123);
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new MutableResource('foo');
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new MutableResource({foo: 'bar'});
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new MutableResource(() => {});
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new MutableResource(schema.users);
      }).to.not.throw(Error);
    });

    it('should look like a ResourceBase', () => {
      const mutableUsers = new MutableResource(schema.users);

      expect(mutableUsers)
        .to.be.instanceof(MutableResource);
      expect(mutableUsers)
        .to.have.property('_schemaPath')
          .that.is.an.instanceof(SchemaPath);
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
    let schema: Schema;

    beforeEach(() => {
      mock_reset();

      schema = new Schema();
      schema.addLeaf(createSchemaCollection('users'));
    });

    describe('create', () => {
      const sentData = { name: 'foo joe' };
      const responseData = { id: 1, name: 'foo joe' };
      const expectedDescriptor: IKeyValue = {
        action: IActionType.create,
        basePath: '/users',
        cacheStrategy: IStrategy.replace,
        classify: IClassification.collection,
        collectionStrategy: IStrategy.merge,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        navPath: '.users',
        payload: sentData,
        type: 'user',
        valid: true
      };
      let mutableUsers: MutableResource;
      let store: Store;
      let spyMutableUsers_generateDescriptor: SinonSpy;
      let spyStore_touchResource: SinonSpy;
      let spyStore_updateResource: SinonSpy;
      let spyStore_destroyResource: SinonSpy;

      beforeEach(() => {
        mutableUsers = new MutableResource(schema.users);
        store = schema.__node.definition.storeMap.getOrCreate('user');
        expectedDescriptor.store = store;

        spyMutableUsers_generateDescriptor = spy(mutableUsers, '_generateDescriptor');
        spyStore_touchResource = spy(store, 'touchResource');
        spyStore_updateResource = spy(store, 'updateResource');
        spyStore_destroyResource = spy(store, 'destroyResource');

        mock_reset();
        mock_post('/users', responseData);
      });

      it('returns a promise', () => {
        const result = mutableUsers.create(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () =>
        mutableUsers
          .create(sentData)
          .then(([result, response, descriptor]: TRequestResult) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));

      it('correctly handles a void hook', () =>
        mutableUsers
          .create(sentData, (data, _response, descriptor) => {
            expect(data).to.deep.equal(responseData);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]: TRequestResult) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }));

      it('correctly handles return value from a hook', () =>
        mutableUsers
          .create(sentData, (data: IKeyValue, _response, _descriptor) =>
            ({
              id: data.id,
              name: data.name.toUpperCase()
            }))
            .then(([result, response, descriptor]: TRequestResult) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal({
              id: responseData.id,
              name: responseData.name.toUpperCase()
            });
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));
    });

    describe('destroy', () => {
      const sentData = { name: 'foo joe' };
      const expectedDescriptor = {
        action: IActionType.delete,
        basePath: '/users',
        cacheStrategy: IStrategy.replace,
        classify: IClassification.collection,
        collectionStrategy: IStrategy.replace,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        payload: sentData,
        type: 'user',
        store: null,
        valid: true
      };
      let mutableUsers: MutableResource;
      let store: Store;
      let spyMutableUsers_generateDescriptor: SinonSpy;
      let spyStore_touchResource: SinonSpy;
      let spyStore_updateResource: SinonSpy;
      let spyStore_destroyResource: SinonSpy;

      beforeEach(() => {
        mutableUsers = new MutableResource(schema.users);
        store = expectedDescriptor.store = schema.__node.definition.storeMap.getOrCreate('user');

        spyMutableUsers_generateDescriptor = spy(mutableUsers, '_generateDescriptor');
        spyStore_touchResource = spy(store, 'touchResource');
        spyStore_updateResource = spy(store, 'updateResource');
        spyStore_destroyResource = spy(store, 'destroyResource');

        mock_reset();
        mock_delete('/users');
      });

      it('returns a promise', () => {
        const result = mutableUsers.destroy(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () =>
        mutableUsers
          .destroy(sentData)
          .then(([result, response, descriptor]: TRequestResult) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(0);
            expect(spyStore_destroyResource.callCount).to.equal(1);
            expect(spyStore_destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(spyStore_destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));

      it('correctly handles a void hook', () =>
        mutableUsers
          .destroy(sentData, (data, _response, descriptor) => {
            expect(data).to.equal(null);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(0);
            expect(spyStore_destroyResource.callCount).to.equal(1);
            expect(spyStore_destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(spyStore_destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));

      it('correctly handles return value from a hook', () =>
        mutableUsers
          .destroy(sentData, (_data, _response, _descriptor) =>
            ({
              id: 1,
              name: 'foo'
            }))
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(0);
            expect(spyStore_destroyResource.callCount).to.equal(1);
            expect(spyStore_destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(spyStore_destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: mutableUsers
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));
    });

    describe('update', () => {
      const sentData = { name: 'foo joe' };
      const responseData = { id: 1, name: 'foo joe' };
      const expectedDescriptor = {
        action: IActionType.update,
        basePath: '/users',
        cacheStrategy: IStrategy.replace,
        classify: IClassification.collection,
        collectionStrategy: IStrategy.replace,
        event: '/users',
        fragments: [],
        id: null,
        params: {},
        partial: FRAGMENT_DEFAULT,
        path: '/users',
        payload: sentData,
        type: 'user',
        store: null,
        valid: true
      };
      let mutableUsers: MutableResource;
      let store: Store;
      let spyMutableUsers_generateDescriptor: SinonSpy;
      let spyStore_touchResource: SinonSpy;
      let spyStore_updateResource: SinonSpy;
      let spyStore_destroyResource: SinonSpy;

      beforeEach(() => {
        mutableUsers = new MutableResource(schema.users);
        store = expectedDescriptor.store = schema.__node.definition.storeMap.getOrCreate('user');

        spyMutableUsers_generateDescriptor = spy(mutableUsers, '_generateDescriptor');
        spyStore_touchResource = spy(store, 'touchResource');
        spyStore_updateResource = spy(store, 'updateResource');
        spyStore_destroyResource = spy(store, 'destroyResource');

        mock_reset();
        mock_put('/users', responseData);
      });

      it('returns a promise', () => {
        const result = mutableUsers.update(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () =>
        mutableUsers
          .update(sentData)
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));

      it('correctly handles a void hook', () =>
        mutableUsers
          .update(sentData, (data, _response, descriptor) => {
            expect(data).to.deep.equal(responseData);
            expect(descriptor).to.deep.match(expectedDescriptor);
          })
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));

      it('correctly handles return value from a hook', () =>
        mutableUsers
          .update(sentData, (data: IKeyValue, _response, _descriptor) =>
            ({
              id: data.id,
              name: data.name.toUpperCase()
            }))
          .then(([result, response, descriptor]) => {
            // promise results
            expect(result).to.be.instanceof(FragmentResult);
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
            expect(descriptor).to.equal(spyStore_touchResource.getCall(0).args[0]);

            // hooks
            expect(spyMutableUsers_generateDescriptor.callCount).to.equal(1);
            expect(spyStore_touchResource.callCount).to.equal(1);
            expect(spyStore_touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(spyStore_updateResource.callCount).to.equal(1);
            expect(spyStore_updateResource.getCall(0).args[1]).to.deep.equal({
              id: responseData.id,
              name: responseData.name.toUpperCase()
            });
            expect(spyStore_destroyResource.callCount).to.equal(0);
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          }));
    });
  });

  describe('behaviors', () => {
    let schema: Schema;

    beforeEach(() => {
      mock_reset();

      schema = new Schema();
      schema.addLeaf(createSchemaCollection('users'));
    });

    describe('item', () => {
      it('properly updates collections when mutated', () => {
        mock_get('/users', dataCollectionUsers1);

        const resourceUsers = new Resource(schema.users);
        const mutableUser = new MutableResource(schema.users.user.withParams({
          userId: 1
        }));

        expect(resourceUsers).to.deep.match({
          data: null,
          status: IStatus.stale,
          timestamp: ITimestamp.loading
        });

        return delay_for_resource_request(resourceUsers)()
          .then(() => {
            expect(resourceUsers).to.deep.match({
              data: dataCollectionUsers1,
              status: IStatus.complete,
              timestamp: (val: number) => val > ITimestamp.loading
            });

            mock_put('/users/1', { id: 1, name: 'bob foo' });
            const promiseUpdate = mutableUser.update({ name: 'bob foo' });

            // The `touch` event from our `update` does not affect the collection
            expect(resourceUsers).to.deep.match({
              data: dataCollectionUsers1,
              status: IStatus.complete,
              timestamp: (val: number) => val > ITimestamp.loading
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
              status: IStatus.complete,
              timestamp: (val: number) => val > ITimestamp.loading
            });
          });
      });
    });
  });
});
