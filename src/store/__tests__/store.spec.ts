/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { spy } from 'sinon';

import { Store } from 'store/store';
import { descriptorCollection, descriptorFrom } from 'test/TestHelper';
import { extend } from 'util/tools';
import { IKeyValue, IStatus } from 'util/types';

// tslint:disable no-magic-numbers

const dataSegmentId_1 = {
  id: 1,
  title: 'Foo Project'
};

const dataSegmentId_2 = {
  id: 2,
  title: 'Bar Project'
};

let refStore: Store;

const fixtureStore = (): void => {
  refStore = new Store();

  refStore.updateResource(descriptorCollection({
    basePath: '/projects'
  }), [dataSegmentId_1, dataSegmentId_2], IStatus.complete);
};

const testInvalidateResult = (args: any[], result: any[]): void => {
  it('should properly invoke invalidate', () => {
    const spyStore_invalidate = spy(refStore.cache, 'invalidate');

    refStore.invalidate.apply(refStore, args);

    expect(spyStore_invalidate.callCount).to.equal(1);
    expect(spyStore_invalidate.getCall(0).args)
      .to.deep.equal(result);
  });
};

const testInvalidateSubscriber = (args: any[], expectedEmits: IKeyValue[]): void => {
  it('should trigger a subscriber', () => {
    const spyStore_emit = spy(refStore, 'emit');

    refStore.invalidate.apply(refStore, args);

    expect(spyStore_emit.callCount).to.equal(expectedEmits.length);
    for (let i = 0; i < expectedEmits.length; i++) {
      expect(spyStore_emit.getCall(i).args[1])
        .to.be.a('object')
        .to.deep.equal(extend({
          type: refStore.definition.type
        }, expectedEmits[i]));
    }
  });
};

describe('Store', () => {
  describe('instance method', () => {
    beforeEach(fixtureStore);

    describe('reset', () => {
      it('should properly reset the fragment map by assigning a new instance', () => {
        const cache = refStore.cache;

        refStore.reset();

        expect(refStore.cache).to.not.equal(cache);
        expect(refStore.cache.fragments).to.deep.equal({});
      });
    });

    describe('invalidate', () => {
      describe('with no arguments', () => {
        testInvalidateResult([], [undefined, {}]);
        testInvalidateSubscriber([], [
          {
            fragment: '1',
            action: 'invalidate'
          },
          {
            fragment: '2',
            action: 'invalidate'
          },
          {
            query: '/projects',
            action: 'invalidate'
          }
        ]);
      });

      describe('with a descriptor argument', () => {
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        testInvalidateResult([descriptor], [descriptor, {}]);
        testInvalidateSubscriber([descriptor], [
          {
            query: '/projects',
            action: 'invalidate'
          }
        ]);
      });

      describe('with options argument first', () => {
        const options = { foo: 123 };

        testInvalidateResult([options], [undefined, options]);
        testInvalidateSubscriber([options], [
          {
            fragment: '1',
            action: 'invalidate',
            foo: 123
          },
          {
            fragment: '2',
            action: 'invalidate',
            foo: 123
          },
          {
            query: '/projects',
            action: 'invalidate',
            foo: 123
          }
        ]);
      });

      describe('with descriptor and options argument', () => {
        const options = { foo: 123 };
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        testInvalidateResult([descriptor, options], [descriptor, options]);
        testInvalidateSubscriber([descriptor, options], [
          {
            query: '/projects',
            action: 'invalidate',
            foo: 123
          }
        ]);
      });

      describe('with invalid argument', () => {
        it('should throw an error', () => {
          const spyStore_invalidate = spy(refStore.cache, 'invalidate');

          expect(() => {
            // @ts-ignore
            refStore.invalidate(123);
          }).to.throw(Error);

          expect(spyStore_invalidate.callCount).to.equal(0);
        });
      });
    });

    describe('fetchResource', () => {
      it('should properly invoke cache fetch', () => {
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        const spyStore_fetch = spy(refStore.cache, 'fetch');

        refStore.fetchResource(descriptor);

        expect(spyStore_fetch.callCount).to.equal(1);
        expect(spyStore_fetch.getCall(0).args[0]).to.equal(descriptor);
      });
    });

    describe('touchResource', () => {
      it('should properly invoke cache touch', () => {
        let disposer;
        const callback = spy();
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        const spyStore_touch = spy(refStore.cache, 'touch');
        disposer = refStore.on(descriptor.event!, callback);
        refStore.touchResource(descriptor, dataSegmentId_1);
        disposer.dispose();

        expect(callback.callCount).to.equal(1);
        expect(spyStore_touch.callCount).to.equal(1);
        expect(spyStore_touch.getCall(0).args[0]).to.equal(descriptor);
        expect(spyStore_touch.getCall(0).args[1]).to.equal(dataSegmentId_1);
      });
    });

    describe('updateResource', () => {
      it('should properly invoke cache update', () => {
        let disposer;
        const callback = spy();
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        const spyStore_update = spy(refStore.cache, 'update');
        disposer = refStore.on(descriptor.event!, callback);
        refStore.updateResource(descriptor, dataSegmentId_1);
        disposer.dispose();

        expect(callback.callCount).to.equal(1);
        expect(spyStore_update.callCount).to.equal(1);
        expect(spyStore_update.getCall(0).args[0]).to.equal(descriptor);
        expect(spyStore_update.getCall(0).args[1]).to.equal(dataSegmentId_1);
      });
    });

    describe('deleteResource', () => {
      it('should properly invoke cache destroy', () => {
        let disposer;
        const callback = spy();
        const descriptor = descriptorFrom({
          basePath: '/projects'
        });

        const spyStore_destroy = spy(refStore.cache, 'destroy');
        disposer = refStore.on(descriptor.event!, callback);
        refStore.destroyResource(descriptor);
        disposer.dispose();

        expect(callback.callCount).to.equal(1);
        expect(spyStore_destroy.callCount).to.equal(1);
        expect(spyStore_destroy.getCall(0).args[0]).to.equal(descriptor);
      });
    });
  });
});
