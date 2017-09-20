/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const Promise = require('bluebird');
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchema = require('RefraxSchema');
const RefraxFragmentResult = require('RefraxFragmentResult');
const RefraxConstants = require('RefraxConstants');
const createSchemaCollection = require('createSchemaCollection');
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_UPDATE = RefraxConstants.action.update;
const ACTION_DELETE = RefraxConstants.action.delete;
const STRATEGY_MERGE = RefraxConstants.strategy.merge;
const STRATEGY_REPLACE = RefraxConstants.strategy.replace;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const expect = chai.expect;

/* global mock_post mock_put mock_reset mock_delete */
/* eslint-disable no-new, indent */
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
      var resource = new RefraxMutableResource(schema.users);

      expect(resource)
        .to.be.instanceof(RefraxMutableResource);
      expect(resource)
        .to.have.property('_schemaPath')
          .that.is.an.instanceof(RefraxSchemaPath);
      expect(resource)
        .to.have.property('_paths')
          .that.is.an.instanceof(Array);
      expect(resource)
        .to.have.property('_options')
          .that.is.an.instanceof(RefraxOptions);
      expect(resource)
        .to.have.property('_parameters')
          .that.is.an.instanceof(RefraxParameters);
      expect(resource)
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
      let resource, store;

      beforeEach(() => {
        resource = new RefraxMutableResource(schema.users);
        store = schema.__storeMap.getOrCreate('user');
        expectedDescriptor.store = store;

        sinon.spy(resource, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_post('/users', responseData);
      });

      it('returns a promise', () => {
        const result = resource.create(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
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
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(1);
            expect(store.updateResource.getCall(0).args[1]).to.deep.equal(responseData);
            expect(store.destroyResource.callCount).to.equal(0);
          });
      });

      it('correctly handles return value from a hook', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
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
      let resource, store;

      beforeEach(() => {
        resource = new RefraxMutableResource(schema.users);
        store = expectedDescriptor.store = schema.__storeMap.getOrCreate('user');

        sinon.spy(resource, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_delete('/users', responseData);
      });

      it('returns a promise', () => {
        const result = resource.destroy(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: resource
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles a void hook', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: resource
            });
          }, () => {
            expect.fail(null, null, 'unexpected catch');
          });
      });

      it('correctly handles return value from a hook', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
            expect(store.touchResource.callCount).to.equal(1);
            expect(store.touchResource.getCall(0).args[0]).to.deep.match(expectedDescriptor);
            expect(store.updateResource.callCount).to.equal(0);
            expect(store.destroyResource.callCount).to.equal(1);
            expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor);
            expect(store.destroyResource.getCall(0).args[1]).to.deep.equal({
              invoker: resource
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
      let resource, store;

      beforeEach(() => {
        resource = new RefraxMutableResource(schema.users);
        store = expectedDescriptor.store = schema.__storeMap.getOrCreate('user');

        sinon.spy(resource, '_generateDescriptor');
        sinon.spy(store, 'touchResource');
        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        mock_reset();
        mock_put('/users', responseData);
      });

      it('returns a promise', () => {
        const result = resource.update(sentData);

        expect(result).to.be.instanceof(Promise);

        return result;
      });

      it('makes a request and processes response correctly', () => {
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
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
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
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
        return resource
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
            expect(resource._generateDescriptor.callCount).to.equal(1);
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
});
