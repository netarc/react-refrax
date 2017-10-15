/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { descriptorFrom, descriptorCollection } from 'TestHelper';
import RefraxConstants from 'RefraxConstants';
import RefraxStore from 'RefraxStore';
import { extend } from 'RefraxTools';


const dataSegmentId_1 = {
  id: 1,
  title: 'Foo Project'
};

const dataSegmentId_2 = {
  id: 2,
  title: 'Bar Project'
};

var refStore;

function fixtureStore() {
  refStore = new RefraxStore();

  refStore.updateResource(descriptorCollection({
    basePath: '/projects'
  }), [dataSegmentId_1, dataSegmentId_2], RefraxConstants.status.complete);
}

function testInvalidateResult(args, result) {
  it('should properly invoke invalidate', function() {
    sinon.spy(refStore.cache, 'invalidate');

    refStore.invalidate.apply(refStore, args);

    expect(refStore.cache.invalidate.callCount).to.equal(1);
    expect(refStore.cache.invalidate.getCall(0).args)
      .to.deep.equal(result);
  });
}

function testInvalidateSubscriber(args, expectedEmits) {
  it('should trigger a subscriber', function() {
    sinon.spy(refStore, 'emit');

    refStore.invalidate.apply(refStore, args);

    expect(refStore.emit.callCount).to.equal(expectedEmits.length);
    for (var i = 0; i < expectedEmits.length; i++) {
      expect(refStore.emit.getCall(i).args[1])
        .to.be.a('object')
        .to.deep.equal(extend({
          type: refStore.definition.type
        }, expectedEmits[i]));
    }
  });
}

/* eslint-disable no-new */
describe('RefraxStore', function() {
  describe('instance method', function() {
    beforeEach(fixtureStore);

    describe('reset', function() {
      it('should properly reset the fragment map by assigning a new instance', function() {
        var cache = refStore.cache;

        refStore.reset();

        expect(refStore.cache).to.not.equal(cache);
        expect(refStore.cache.fragments).to.deep.equal({});
      });
    });

    describe('invalidate', function() {
      describe('with no arguments', function() {
        testInvalidateResult([], [null, {}]);
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

      describe('with a descriptor argument', function() {
        var descriptor = descriptorFrom({
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

      describe('with options argument first', function() {
        var options = {foo: 123};

        testInvalidateResult([options], [null, options]);
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

      describe('with descriptor and options argument', function() {
        var options = {foo: 123}
          , descriptor = descriptorFrom({
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

      describe('with invalid argument', function() {
        it('should throw an error', function() {
          sinon.spy(refStore.cache, 'invalidate');

          expect(function() {
            refStore.invalidate(123);
          }).to.throw(Error);

          expect(refStore.cache.invalidate.callCount).to.equal(0);
        });
      });
    });

    describe('fetchResource', function() {
      it('should properly invoke cache fetch', function() {
        var descriptor = descriptorFrom({
          basePath: '/projects'
        });

        sinon.spy(refStore.cache, 'fetch');

        refStore.fetchResource(descriptor);

        expect(refStore.cache.fetch.callCount).to.equal(1);
        expect(refStore.cache.fetch.getCall(0).args[0]).to.equal(descriptor);
      });
    });

    describe('touchResource', function() {
      it('should properly invoke cache touch', function() {
        var disposer
          , callback = sinon.spy()
          , descriptor = descriptorFrom({
            basePath: '/projects'
          });

        sinon.spy(refStore.cache, 'touch');
        disposer = refStore.subscribe(descriptor.event, callback);
        refStore.touchResource(descriptor, dataSegmentId_1);
        disposer();

        expect(callback.callCount).to.equal(1);
        expect(refStore.cache.touch.callCount).to.equal(1);
        expect(refStore.cache.touch.getCall(0).args[0]).to.equal(descriptor);
        expect(refStore.cache.touch.getCall(0).args[1]).to.equal(dataSegmentId_1);
      });
    });

    describe('updateResource', function() {
      it('should properly invoke cache update', function() {
        var disposer
          , callback = sinon.spy()
          , descriptor = descriptorFrom({
            basePath: '/projects'
          });

        sinon.spy(refStore.cache, 'update');
        disposer = refStore.subscribe(descriptor.event, callback);
        refStore.updateResource(descriptor, dataSegmentId_1);
        disposer();

        expect(callback.callCount).to.equal(1);
        expect(refStore.cache.update.callCount).to.equal(1);
        expect(refStore.cache.update.getCall(0).args[0]).to.equal(descriptor);
        expect(refStore.cache.update.getCall(0).args[1]).to.equal(dataSegmentId_1);
      });
    });

    describe('deleteResource', function() {
      it('should properly invoke cache destroy', function() {
        var disposer
          , callback = sinon.spy()
          , descriptor = descriptorFrom({
            basePath: '/projects'
          });

        sinon.spy(refStore.cache, 'destroy');
        disposer = refStore.subscribe(descriptor.event, callback);
        refStore.destroyResource(descriptor);
        disposer();

        expect(callback.callCount).to.equal(1);
        expect(refStore.cache.destroy.callCount).to.equal(1);
        expect(refStore.cache.destroy.getCall(0).args[0]).to.equal(descriptor);
      });
    });
  });
});
