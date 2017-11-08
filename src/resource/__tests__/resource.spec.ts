/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { spy } from 'sinon';

import {
  delay_for,
  delay_for_resource_request,
  mock_get,
  mock_request_count,
  mock_reset,
  wait_for_promise
} from 'test/TestSupport';

import { ResourceDescriptor } from 'resource/descriptor';
import { Resource } from 'resource/resource';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { Schema } from 'schema/schema';
import { FragmentResult } from 'store/fragmentResult';
import { RefraxOptions } from 'util/composableHash';
import {
  IActionType,
  IStatus,
  ITimestamp,
  TRequestResult
} from 'util/types';

// tslint:disable: no-unused-expression no-empty no-magic-numbers

const dataCollectionUsers = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' }
];

const dataCollectionUsersUpdate = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' },
  { id: 3, name: 'zip zoo' }
];

describe('resource', () => {
  let schema: Schema;

  beforeEach(() => {
    mock_reset();
    mock_get('/users', dataCollectionUsers);

    schema = new Schema();
    schema.addLeaf(createSchemaCollection('users'));
  });

  describe('instantiation', () => {
    it('should require a valid accessor', () => {
      expect(() => {
        // @ts-ignore - invalid argument
        new Resource();
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore - invalid argument
        new Resource(123);
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore - invalid argument
        new Resource('foo');
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore - invalid argument
        new Resource({ foo: 'bar' });
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore - invalid argument
        new Resource(() => {});
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore - invalid argument
        new Resource(schema.users);
      }).to.not.throw(Error);
    });

    it('should look and behave like a Resource', () => {
      const onLoad = spy();
      const onChange = spy();
      const store = schema.__node.definition.storeMap.getOrCreate('user');
      spy(store, 'once');

      const resource = new Resource(schema.users);

      expect(resource)
        .to.be.instanceof(Resource);
      expect(resource)
        .to.have.property('timestamp')
          .that.equals(ITimestamp.loading);
      expect(resource)
        .to.have.property('status')
          .that.equals(IStatus.stale);
      expect(resource)
        .to.have.property('data')
          .that.equals(null);
      expect(resource)
        .to.have.property('_dispatchLoad')
          .that.is.a('function');

      resource.on('load', onLoad);
      resource.on('change', onChange);
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
          expect(resource.status).to.equal(IStatus.complete);
          expect(resource.timestamp).to.not.equal(ITimestamp.loading);
          expect(store.once.callCount).to.equal(0);

          const descriptor = new ResourceDescriptor(null, IActionType.get, schema.users.__stack);
          store.updateResource(descriptor, dataCollectionUsersUpdate, IStatus.complete);

          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(2);
          expect(resource.data).to.deep.equal(dataCollectionUsersUpdate);
          expect(resource.status).to.equal(IStatus.complete);
          expect(resource.timestamp).to.not.equal(ITimestamp.loading);
        });
    });
  });

  describe('methods', () => {
    describe('_fetchFragment', () => {
      describe('invoked with', () => {
        describe('no arguments', () => {
          it('should make request if not cached', () => {
            const onLoad = spy();
            const onChange = spy();
            // Disable fetching so we can test later
            const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));

            resource.on('load', onLoad);
            resource.on('change', onChange);

            return delay_for()()
              .then(() => {
                // prove Resource made no request
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(IStatus.stale);
                expect(resource.timestamp).to.equal(ITimestamp.stale);
                expect(mock_request_count()).to.equal(0);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const fragment = resource._fetchFragment();
                expect(fragment).is.instanceof(FragmentResult);
                expect(fragment.data).to.equal(null);
                expect(fragment.status).to.equal(IStatus.stale);
                expect(fragment.timestamp).to.equal(ITimestamp.loading);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(IStatus.stale);
                expect(resource.timestamp).to.equal(ITimestamp.loading);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                return wait_for_promise(() => resource.status === IStatus.complete)
                  .then(() => {
                    expect(onLoad.callCount).to.equal(1);
                    expect(onChange.callCount).to.equal(1);
                    expect(mock_request_count()).to.equal(1);
                    expect(resource.data).to.deep.equal(dataCollectionUsers);
                    expect(resource.status).to.equal(IStatus.complete);
                    expect(resource.timestamp).to.not.equal(ITimestamp.loading);
                  });
              });
          });

          it('should not make request if cached', () => {
            const onLoad = spy();
            const onChange = spy();
            const resource = new Resource(schema.users, new RefraxOptions());
            let fragment: FragmentResult;

            resource.on('load', onLoad);
            resource.on('change', onChange);

            return delay_for_resource_request(resource)()
              .then(() => {
                expect(onLoad.callCount).to.equal(1);
                expect(onChange.callCount).to.equal(1);
                expect(mock_request_count()).to.equal(1);
                expect(resource.data).to.deep.equal(dataCollectionUsers);
                expect(resource.status).to.equal(IStatus.complete);
                expect(resource.timestamp).to.not.equal(ITimestamp.loading);

                fragment = resource._fetchFragment();
              })
              .then(delay_for())
              .then(() => {
                expect(fragment).is.instanceof(FragmentResult);
                expect(fragment.data).to.deep.equal(dataCollectionUsers);
                expect(fragment.status).to.equal(IStatus.complete);
                expect(fragment.timestamp).to.not.equal(ITimestamp.loading);
                expect(resource.data).to.deep.equal(dataCollectionUsers);
                expect(resource.status).to.equal(IStatus.complete);
                expect(resource.timestamp).to.not.equal(ITimestamp.loading);
                expect(mock_request_count()).to.equal(1);
                expect(onLoad.callCount).to.equal(1);
                expect(onChange.callCount).to.equal(1);
              });
          });
        });

        describe('noFetchGet', () => {
          it('should look and behave as expected', () => {
            const onLoad = spy();
            const onChange = spy();
            const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));

            resource.on('load', onLoad);
            resource.on('change', onChange);

            return delay_for()()
              .then(() => {
                // prove Resource made no request
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(IStatus.stale);
                expect(resource.timestamp).to.equal(ITimestamp.stale);
                expect(mock_request_count()).to.equal(0);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const promise = resource._fetchFragment({ noFetchGet: true });
                expect(promise).is.instanceof(FragmentResult);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(IStatus.stale);
                expect(resource.timestamp).to.equal(ITimestamp.stale);
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);
              })
              .then(delay_for())
              .then(() => {
                // no request occurs after fetching
                expect(onLoad.callCount).to.equal(0);
                expect(onChange.callCount).to.equal(0);
                expect(resource.data).to.equal(null);
                expect(resource.status).to.equal(IStatus.stale);
                expect(resource.timestamp).to.equal(ITimestamp.stale);
                expect(mock_request_count()).to.equal(0);
              });
          });
        });
      });
    });

    describe('_subscribeToStore', () => {
      it('correctly sets up a a subscriber', () => {
        const store = schema.__node.definition.storeMap.getOrCreate('user');
        const descriptor = new ResourceDescriptor(null, IActionType.get, schema.users.__stack);
        const resource = new Resource(schema.users, new RefraxOptions({ noSubscribe: true }));
        const onChange = spy();

        resource.on('change', onChange);

        store.updateResource(descriptor, dataCollectionUsers, IStatus.complete);

        // @ts-ignore _disposables protected
        expect(resource._disposables.length).to.equal(2);
        expect(onChange.callCount).to.equal(0);

        resource._generateDescriptor(IActionType.get, (d: ResourceDescriptor) => {
          resource._subscribeToStore(d);
        });

        expect(onChange.callCount).to.equal(0);
        // @ts-ignore _disposables protected
        expect(resource._disposables.length).to.equal(3);

        store.updateResource(descriptor, dataCollectionUsersUpdate, IStatus.complete);

        expect(onChange.callCount).to.equal(1);
      });
    });

    describe('_updateCache', () => {
      it('invokes _fetchFragment and passes arguments', () => {
        const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));
        const spyFetchFragment = spy(resource, '_fetchFragment');
        const spyDispatchLoad = spy(resource, '_dispatchLoad');

        return delay_for()()
          .then(() => {
            // prove Resource made no request
            expect(resource.data).to.equal(null);
            expect(resource.status).to.equal(IStatus.stale);
            expect(resource.timestamp).to.equal(ITimestamp.stale);
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
            expect(resource.status).to.equal(IStatus.complete);
            expect(resource.timestamp).to.not.equal(ITimestamp.loading);
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

    describe('_fetchFragment', () => {
      beforeEach(mock_reset);

      describe('invoked with', () => {
        describe('no arguments', () => {
          it('should look and behave as expected', () => {
            mock_get('/users', dataCollectionUsers);
            const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));

            return delay_for()()
              .then(() => {

                expect(mock_request_count()).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const result = resource._fetchFragment();
                expect(result).is.instanceof(FragmentResult);

                const start = mock_request_count();

                return wait_for_promise(() => mock_request_count() !== start)
                  .then(() => {
                    expect(mock_request_count()).to.equal(1);
                  });
              });
          });
        });

        describe('noFetchGet', () => {
          it('should look and behave as expected', () => {
            const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));

            return delay_for()()
              .then(() => {
                mock_get('/users', dataCollectionUsers);

                expect(mock_request_count()).to.equal(0);

                // re-enable fetch get
                resource._options.noFetchGet = false;

                const result = resource._fetchFragment({ noFetchGet: true });
                expect(result).is.instanceof(FragmentResult);

                return delay_for()()
                  .then(() => {
                    expect(mock_request_count()).to.equal(0);
                  });
              });
            });
        });
      });
    });

    describe('get', () => {
      beforeEach(mock_reset);

      describe('invoked with no arguments', () => {
        it('should invoke a `get` descriptor', () => {
          const resource = new Resource(schema.users, new RefraxOptions({ noFetchGet: true }));

          mock_get('/users', dataCollectionUsers);

          const fragment = resource._fetchFragment({ noFetchGet: true, fragmentOnly: true }) as FragmentResult;
          expect(fragment.data).to.equal(null);

          return resource.get().then(([result, _response, _descriptor]: TRequestResult) => {
            expect(result).is.instanceof(FragmentResult);
            expect(result.data).to.deep.equal(dataCollectionUsers);
          });
        });
      });
    });

    describe('invalidate', () => {
      describe('with default behavior', () => {
        it('correctly invalidates cache and fetches', () => {
          const resource = new Resource(schema.users);
          const store = schema.__node.definition.storeMap.getOrCreate('user');
          spy(store, 'invalidate');

          return wait_for_promise(() => resource.status === IStatus.complete)
            .then(() => {
              expect(mock_request_count()).to.equal(1);

              mock_get('/users', dataCollectionUsers);
              resource.invalidate({ foo: 123 });

              expect(store.invalidate.callCount).to.equal(1);
              expect(store.invalidate.getCall(0).args[1]).to.deep.equal({
                foo: 123,
                invoker: resource
              });
              expect(resource.status).to.equal(IStatus.stale);
              expect(resource.timestamp).to.equal(ITimestamp.loading);
              expect(mock_request_count()).to.equal(1);
            })
            .then(delay_for_resource_request(resource))
            .then(() => {
              expect(mock_request_count()).to.equal(2);
              expect(resource.status).to.equal(IStatus.complete);
              expect(resource.timestamp).to.not.equal(ITimestamp.stale);
            });
        });
      });

      describe('with noFetchGet', () => {
        it('correctly invalidates cache and does not fetch', () => {
          const resource = new Resource(schema.users);
          const store = schema.__node.definition.storeMap.getOrCreate('user');
          spy(store, 'invalidate');

          return wait_for_promise(() => resource.status === IStatus.complete)
            .then(() => {
              expect(mock_request_count()).to.equal(1);

              resource.invalidate({ foo: 123, noFetchGet: true });

              expect(store.invalidate.callCount).to.equal(1);
              expect(store.invalidate.getCall(0).args[1]).to.deep.equal({
                foo: 123,
                noFetchGet: true,
                invoker: resource
              });
              expect(resource.status).to.equal(IStatus.stale);
              expect(resource.timestamp).to.equal(ITimestamp.stale);
              expect(mock_request_count()).to.equal(1);
            })
            .then(delay_for())
            .then(() => {
              // no request occurs after invalidating
              expect(mock_request_count()).to.equal(1);
              expect(resource.status).to.equal(IStatus.stale);
              expect(resource.timestamp).to.equal(ITimestamp.stale);
            });
        });
      });
    });

    describe('isLoading', () => {
      it('correctly reflects state', () => {
        const resource = new Resource(schema.users);

        expect(resource.isLoading()).to.equal(true);

        return wait_for_promise(() => resource.status === IStatus.complete)
          .then(() => {
            expect(resource.isLoading()).to.equal(false);
          });
      });
    });

    describe('isStale', () => {
      it('correctly reflects state', () => {
        const resource = new Resource(schema.users);

        expect(resource.isStale()).to.equal(true);

        return wait_for_promise(() => resource.status === IStatus.complete)
          .then(() => {
            expect(resource.isStale()).to.equal(false);
          });
      });
    });

    describe('hasData', () => {
      it('correctly reflects state', () => {
        const resource = new Resource(schema.users);

        expect(resource.hasData()).to.equal(false);

        return wait_for_promise(() => resource.status === IStatus.complete)
          .then(() => {
            expect(resource.hasData()).to.equal(true);
          });
      });

      it('correctly reflects state during re-fetch', () => {
        const resource = new Resource(schema.users);

        expect(resource.hasData()).to.equal(false);

        return wait_for_promise(() => resource.status === IStatus.complete)
          .then(() => {
            expect(resource.hasData()).to.equal(true);

            mock_get('/users', dataCollectionUsers);
            resource.get();

            expect(resource.hasData()).to.equal(true);

            return wait_for_promise(() => resource.status === IStatus.complete)
              .then(() => {
                expect(resource.hasData()).to.equal(true);
              });
          });
      });
    });
  });
});
