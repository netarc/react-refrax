/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import RefraxResource from 'RefraxResource';
import RefraxOptions from 'RefraxOptions';
import RefraxSchema from 'RefraxSchema';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import RefraxFragmentResult from 'RefraxFragmentResult';
import RefraxConstants from 'RefraxConstants';
import createSchemaCollection from 'createSchemaCollection';

const ACTION_GET = RefraxConstants.action.get;
const STATUS_COMPLETE = RefraxConstants.status.complete;
const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;

const dataCollectionUsers = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' }
];

const dataCollectionUsersUpdate = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' },
  { id: 3, name: 'zip zoo' }
];


/* global mock_get mock_reset mock_request_count wait_for_promise delay_for delay_for_resource_request */
/* eslint-disable no-new, indent */
describe('RefraxResource', () => {
  let schema;

  beforeEach(() => {
    mock_reset();
    mock_get('/users', dataCollectionUsers);

    schema = new RefraxSchema();
    schema.addLeaf(createSchemaCollection('users'));
  });

  describe('instantiation', () => {
    it('should require a valid accessor', () => {
      expect(() => {
        new RefraxResource();
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResource(123);
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResource('foo');
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResource({foo: 'bar'});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResource(() => {});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResource(schema.users);
      }).to.not.throw(Error);
    });

    it('should look and behave like a Resource', () => {
      const onLoad = sinon.spy();
      const onChange = sinon.spy();
      const store = schema.__node.definition.storeMap.getOrCreate('user');
      sinon.spy(store, 'once');

      const resource = new RefraxResource(schema.users);

      expect(resource)
        .to.be.instanceof(RefraxResource);
      expect(resource)
        .to.have.property('timestamp')
          .that.equals(TIMESTAMP_LOADING);
      expect(resource)
        .to.have.property('status')
          .that.equals(STATUS_STALE);
      expect(resource)
        .to.have.property('data')
          .that.equals(null);
      expect(resource)
        .to.have.property('_dispatchLoad')
          .that.is.a('function');

      resource.subscribe('load', onLoad);
      resource.subscribe('change', onChange);
      expect(store.once.callCount).to.equal(0);
      expect(mock_request_count()).to.equal(0);
      expect(onLoad.callCount).to.equal(0);
      expect(onChange.callCount).to.equal(0);

      return delay_for_resource_request(resource)()
        .then(() => {
          expect(mock_request_count()).to.equal(1);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(1);
          expect(resource.data).to.deep.equal(dataCollectionUsers);
          expect(resource.status).to.equal(STATUS_COMPLETE);
          expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);
          expect(store.once.callCount).to.equal(0);

          const descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.users.__stack);
          store.updateResource(descriptor, dataCollectionUsersUpdate, STATUS_COMPLETE);

          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(2);
          expect(resource.data).to.deep.equal(dataCollectionUsersUpdate);
          expect(resource.status).to.equal(STATUS_COMPLETE);
          expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);
        });
    });
  });

  describe('methods', () => {
    describe('_fetchFragment', () => {
      describe('invoked with', () => {
        describe('no arguments', () => {
          it('should make request if not cached', () => {
            const onLoad = sinon.spy();
            const onChange = sinon.spy();
            // Disable fetching so we can test later
            const resource = new RefraxResource(schema.users, new RefraxOptions({ noFetchGet: true }));

            resource.subscribe('load', onLoad);
            resource.subscribe('change', onChange);

            return delay_for()()
              .then(() => {
                // prove Resource made no request
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(STATUS_STALE);
                expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
                expect(mock_request_count()).to.equal(0);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const fragment = resource._fetchFragment();
                expect(fragment).is.instanceof(RefraxFragmentResult);
                expect(fragment.data).to.equal(null);
                expect(fragment.status).to.equal(STATUS_STALE);
                expect(fragment.timestamp).to.equal(TIMESTAMP_LOADING);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(STATUS_STALE);
                expect(resource.timestamp).to.equal(TIMESTAMP_LOADING);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                return wait_for_promise(() => resource.status === STATUS_COMPLETE)
                  .then(() => {
                    expect(onLoad.callCount).to.equal(1);
                    expect(onChange.callCount).to.equal(1);
                    expect(mock_request_count()).to.equal(1);
                    expect(resource.data).to.deep.equal(dataCollectionUsers);
                    expect(resource.status).to.equal(STATUS_COMPLETE);
                    expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);
                  });
              });
          });

          it('should not make request if cached', () => {
            const onLoad = sinon.spy();
            const onChange = sinon.spy();
            const resource = new RefraxResource(schema.users, new RefraxOptions());

            resource.subscribe('load', onLoad);
            resource.subscribe('change', onChange);

            let fragment = null;
            return delay_for_resource_request(resource)()
              .then(() => {
                expect(onLoad.callCount).to.equal(1);
                expect(onChange.callCount).to.equal(1);
                expect(mock_request_count()).to.equal(1);
                expect(resource.data).to.deep.equal(dataCollectionUsers);
                expect(resource.status).to.equal(STATUS_COMPLETE);
                expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);

                fragment = resource._fetchFragment();
              })
              .then(delay_for())
              .then(() => {
                expect(fragment).is.instanceof(RefraxFragmentResult);
                expect(fragment.data).to.deep.equal(dataCollectionUsers);
                expect(fragment.status).to.equal(STATUS_COMPLETE);
                expect(fragment.timestamp).to.not.equal(TIMESTAMP_LOADING);
                expect(resource.data).to.deep.equal(dataCollectionUsers);
                expect(resource.status).to.equal(STATUS_COMPLETE);
                expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);
                expect(mock_request_count()).to.equal(1);
                expect(onLoad.callCount).to.equal(1);
                expect(onChange.callCount).to.equal(1);
              });
          });
        });

        describe('noFetchGet', () => {
          it('should look and behave as expected', () => {
            const onLoad = sinon.spy();
            const onChange = sinon.spy();
            const resource = new RefraxResource(schema.users, new RefraxOptions({ noFetchGet: true }));

            resource.subscribe('load', onLoad);
            resource.subscribe('change', onChange);

            return delay_for()()
              .then(() => {
                // prove Resource made no request
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(STATUS_STALE);
                expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
                expect(mock_request_count()).to.equal(0);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const promise = resource._fetchFragment({ noFetchGet: true });
                expect(promise).is.instanceof(RefraxFragmentResult);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(STATUS_STALE);
                expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);
              })
              .then(delay_for())
              .then(() => {
                // no request occurs after fetching
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(STATUS_STALE);
                expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
                expect(mock_request_count()).to.equal(0);
              });
          });
        });
      });
    });

    describe('_subscribeToStore', () => {
      it('correctly sets up a a subscriber', () => {
        const store = schema.__node.definition.storeMap.getOrCreate('user');
        const descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.users.__stack);
        const resource = new RefraxResource(schema.users, new RefraxOptions({ noSubscribe: true }));
        const onChange = sinon.spy();

        resource.subscribe('change', onChange);

        store.updateResource(descriptor, dataCollectionUsers, STATUS_COMPLETE);

        expect(resource._disposers.length).to.equal(2);
        expect(onChange.callCount).to.equal(0);

        resource._generateDescriptor(ACTION_GET, (descriptor) => {
          resource._subscribeToStore(descriptor);
        });

        expect(onChange.callCount).to.equal(0);
        expect(resource._disposers.length).to.equal(3);

        store.updateResource(descriptor, dataCollectionUsersUpdate, STATUS_COMPLETE);

        expect(onChange.callCount).to.equal(1);
      });
    });

    describe('_updateCache', () => {
      it('invokes _fetchFragment and passes arguments', () => {
        const resource = new RefraxResource(schema.users, new RefraxOptions({ noFetchGet: true }));
        const spyFetchFragment = sinon.spy(resource, '_fetchFragment');
        const spyDispatchLoad = sinon.spy(resource, '_dispatchLoad');

        return delay_for()()
          .then(() => {
            // prove Resource made no request
            expect(resource.data).to.equal(null);
            expect(resource.status).to.equal(STATUS_STALE);
            expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
            expect(mock_request_count()).to.equal(0);
            expect(spyFetchFragment.callCount).to.equal(0);
            expect(spyDispatchLoad.callCount).to.equal(0);

            // re-enable fetch get
            resource._options.noFetchGet = false;

            resource._updateCache({ foo: 1 });

            expect(spyFetchFragment.callCount).to.equal(1);
            expect(spyFetchFragment.getCall(0).args[0]).to.deep.equal({ foo: 1 });
            expect(spyDispatchLoad.callCount).to.equal(0);
            expect(resource._dispatchLoad).to.equal(spyDispatchLoad);
          })
          .then(delay_for_resource_request(resource))
          .then(() => {
            expect(resource.data).to.deep.equal(dataCollectionUsers);
            expect(resource.status).to.equal(STATUS_COMPLETE);
            expect(resource.timestamp).to.not.equal(TIMESTAMP_LOADING);
            expect(mock_request_count()).to.equal(1);
            expect(spyFetchFragment.callCount).to.equal(2);
            expect(spyFetchFragment.getCall(1).args[0]).to.deep.equal({
              noPropagate: false,
              noFetchGet: false
            });
            expect(spyDispatchLoad.callCount).to.equal(1);
            expect(resource._dispatchLoad).to.equal(null);
          });
      });
    });

    describe('invalidate', () => {
      describe('with default behavior', () => {
        it('correctly invalidates cache and fetches', () => {
          const resource = new RefraxResource(schema.users);
          const store = schema.__node.definition.storeMap.getOrCreate('user');
          sinon.spy(store, 'invalidate');

          return wait_for_promise(() => resource.status === STATUS_COMPLETE)
            .then(() => {
              expect(mock_request_count()).to.equal(1);

              mock_get('/users', dataCollectionUsers);
              resource.invalidate({ foo: 123 });

              expect(store.invalidate.callCount).to.equal(1);
              expect(store.invalidate.getCall(0).args[1]).to.deep.equal({
                foo: 123,
                invoker: resource
              });
              expect(resource.status).to.equal(STATUS_STALE);
              expect(resource.timestamp).to.equal(TIMESTAMP_LOADING);
              expect(mock_request_count()).to.equal(1);
            })
            .then(delay_for_resource_request(resource))
            .then(() => {
              expect(mock_request_count()).to.equal(2);
              expect(resource.status).to.equal(STATUS_COMPLETE);
              expect(resource.timestamp).to.not.equal(TIMESTAMP_STALE);
            });
        });
      });

      describe('with noFetchGet', () => {
        it('correctly invalidates cache and does not fetch', () => {
          const resource = new RefraxResource(schema.users);
          const store = schema.__node.definition.storeMap.getOrCreate('user');
          sinon.spy(store, 'invalidate');

          return wait_for_promise(() => resource.status === STATUS_COMPLETE)
            .then(() => {
              expect(mock_request_count()).to.equal(1);

              resource.invalidate({ foo: 123, noFetchGet: true });

              expect(store.invalidate.callCount).to.equal(1);
              expect(store.invalidate.getCall(0).args[1]).to.deep.equal({
                foo: 123,
                noFetchGet: true,
                invoker: resource
              });
              expect(resource.status).to.equal(STATUS_STALE);
              expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
              expect(mock_request_count()).to.equal(1);
            })
            .then(delay_for())
            .then(() => {
              // no request occurs after invalidating
              expect(mock_request_count()).to.equal(1);
              expect(resource.status).to.equal(STATUS_STALE);
              expect(resource.timestamp).to.equal(TIMESTAMP_STALE);
            });
        });
      });
    });

    describe('isLoading', () => {
      it('correctly reflects state', () => {
        const resource = new RefraxResource(schema.users);

        expect(resource.isLoading()).to.equal(true);

        return wait_for_promise(() => resource.status === STATUS_COMPLETE)
          .then(() => {
            expect(resource.isLoading()).to.equal(false);
          });
      });
    });

    describe('isStale', () => {
      it('correctly reflects state', () => {
        const resource = new RefraxResource(schema.users);

        expect(resource.isStale()).to.equal(true);

        return wait_for_promise(() => resource.status === STATUS_COMPLETE)
          .then(() => {
            expect(resource.isStale()).to.equal(false);
          });
      });
    });

    describe('hasData', () => {
      it('correctly reflects state', () => {
        const resource = new RefraxResource(schema.users);

        expect(resource.hasData()).to.equal(false);

        return wait_for_promise(() => resource.status === STATUS_COMPLETE)
          .then(() => {
            expect(resource.hasData()).to.equal(true);
          });
      });

      it('correctly reflects state during re-fetch', () => {
        const resource = new RefraxResource(schema.users);

        expect(resource.hasData()).to.equal(false);

        return wait_for_promise(() => resource.status === STATUS_COMPLETE)
          .then(() => {
            expect(resource.hasData()).to.equal(true);

            mock_get('/users', dataCollectionUsers);
            resource.get();

            expect(resource.hasData()).to.equal(true);

            return wait_for_promise(() => resource.status === STATUS_COMPLETE)
              .then(() => {
                expect(resource.hasData()).to.equal(true);
              });
          });
      });
    });
  });
});
