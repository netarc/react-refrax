/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { descriptorCollection } from 'TestHelper';
import RefraxConstants from 'RefraxConstants';
import RefraxStore from 'RefraxStore';
import RefraxStoreMap from 'RefraxStoreMap';
import { each } from 'RefraxTools';


const dataSegmentId_1 = {
  id: 1,
  title: 'Foo Project'
};

const dataSegmentId_2 = {
  id: 2,
  title: 'Bar Project'
};

var refStoreMap;

function fixtureStoreMap() {
  refStoreMap = new RefraxStoreMap();
  refStoreMap
    .add(new RefraxStore('project'))
    .updateResource(descriptorCollection({
      basePath: '/projects'
    }), [dataSegmentId_1, dataSegmentId_2], RefraxConstants.status.complete);
  refStoreMap.add(new RefraxStore('user'));
  refStoreMap.add(new RefraxStore('account'));
}

describe('RefraxStore', function() {
  it('should look like a RefraxStore', function() {
    const map = new RefraxStoreMap();

    expect(Object.keys(map)).to.deep.equal(['__map']);
  });

  describe('instance method', function() {
    beforeEach(fixtureStoreMap);

    describe('reset', function() {
      it('should properly call reset on all containing stores', function() {
        each(refStoreMap.__map, function(store) {
          sinon.spy(store, 'reset');
        });

        refStoreMap.reset();

        each(refStoreMap.__map, function(store) {
          expect(store.reset.callCount).to.equal(1);
        });
      });
    });

    describe('invalidate', function() {
      beforeEach(function() {
        each(refStoreMap.__map, function(store) {
          sinon.spy(store, 'invalidate');
        });
      });

      describe('with store only argument', function() {
        it('should properly invalidate matching store types', function() {
          const stores = refStoreMap.__map;
          refStoreMap.invalidate('user');

          expect(stores['account'].invalidate.callCount).to.equal(0);
          expect(stores['project'].invalidate.callCount).to.equal(0);
          expect(stores['user'].invalidate.callCount).to.equal(1);
          expect(stores['user'].invalidate.getCall(0).args).to.deep.equal([{}]);
        });

        it('should properly invalidate matching store objects', function() {
          const stores = refStoreMap.__map;
          refStoreMap.invalidate(stores['user']);

          expect(stores['account'].invalidate.callCount).to.equal(0);
          expect(stores['project'].invalidate.callCount).to.equal(0);
          expect(stores['user'].invalidate.callCount).to.equal(1);
          expect(stores['user'].invalidate.getCall(0).args).to.deep.equal([{}]);
        });

        it('should properly invalidate matching stores', function() {
          const stores = refStoreMap.__map;
          refStoreMap.invalidate([stores['user'], 'project']);

          expect(stores['account'].invalidate.callCount).to.equal(0);
          expect(stores['project'].invalidate.callCount).to.equal(1);
          expect(stores['project'].invalidate.getCall(0).args).to.deep.equal([{}]);
          expect(stores['user'].invalidate.callCount).to.equal(1);
          expect(stores['user'].invalidate.getCall(0).args).to.deep.equal([{}]);
        });
      });

      describe('with option only argument', function() {
        it('should properly invalidate all stores', function() {
          refStoreMap.invalidate({ foo: 123 });

          each(refStoreMap.__map, function(store) {
            expect(store.invalidate.callCount).to.equal(1);
            expect(store.invalidate.getCall(0).args).to.deep.equal([{ foo: 123 }]);
          });
        });
      });
    });

    describe('add', function() {
      describe('with invalid arguments', function() {
        it('should throw an error', function() {
          expect(function() {
            refStoreMap.add();
          }).to.throw(TypeError, 'can only be of type RefraxStore but found type');

          expect(function() {
            refStoreMap.add('foo');
          }).to.throw(TypeError, 'can only be of type RefraxStore but found type');
        });
      });

      describe('with a store argument', function() {
        it('should throw an error when not unique', function() {
          refStoreMap.add(new RefraxStore('foo'));

          expect(function() {
            refStoreMap.add(new RefraxStore('foo'));
          }).to.throw(RangeError, 'has already been previously mapped for');
        });

        it('should properly add', function() {
          const store = new RefraxStore('foo');

          expect(refStoreMap.__map['foo']).to.equal(undefined);

          refStoreMap.add(store);

          expect(refStoreMap.__map['foo']).to.equal(store);
        });
      });
    });

    describe('getOrCreate', function() {
      describe('with invalid arguments', function() {
        it('should throw an error', function() {
          expect(function() {
            refStoreMap.getOrCreate(123);
          }).to.throw(TypeError, 'can only be of type String but found type');

          expect(function() {
            refStoreMap.getOrCreate(new RefraxStore('foo'));
          }).to.throw(TypeError, 'can only be of type String but found type');
        });
      });

      describe('with no arguments', function() {
        it('should return a random store', function() {
          var store1 = refStoreMap.getOrCreate()
            , store2 = refStoreMap.getOrCreate();

          expect(store1).to.be.an.instanceof(RefraxStore);
          expect(store2).to.be.an.instanceof(RefraxStore);
          expect(store1).to.not.equal(store2);
        });
      });

      describe('with a string argument', function() {
        it('should return proper store', function() {
          var store = new RefraxStore('foo');

          expect(refStoreMap.getOrCreate('project')).to.equal(refStoreMap.__map['project']);

          refStoreMap.add(store);
          expect(refStoreMap.getOrCreate('foo')).to.equal(store);
        });
      });
    });
  });
});
