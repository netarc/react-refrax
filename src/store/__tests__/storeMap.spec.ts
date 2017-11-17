/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import { descriptorCollection } from 'test/TestHelper';

import { Store } from '../../store/store';
import { StoreMap } from '../../store/storeMap';
import { each } from '../../util/tools';
import { IStatus } from '../../util/types';

// tslint:disable no-string-literal

const dataSegmentId_1 = {
  id: 1,
  title: 'Foo Project'
};

const dataSegmentId_2 = {
  id: 2,
  title: 'Bar Project'
};

let refStoreMap: StoreMap;

const fixtureStoreMap = (): void => {
  refStoreMap = new StoreMap();
  refStoreMap
    .add(new Store('project'))
    .updateResource(descriptorCollection({
      basePath: '/projects'
    }), [dataSegmentId_1, dataSegmentId_2], IStatus.complete);
  refStoreMap.add(new Store('user'));
  refStoreMap.add(new Store('account'));
};

describe('store/store', () => {
  it('should look like a Store', () => {
    const map = new StoreMap();

    expect(Object.keys(map)).to.deep.equal(['__map']);
  });

  describe('instance method', () => {
    beforeEach(fixtureStoreMap);

    describe('reset', () => {
      it('should properly call reset on all containing stores', () => {
        each(refStoreMap.__map, (store: Store) => {
          spy(store, 'reset');
        });

        refStoreMap.reset();

        each(refStoreMap.__map, (store: Store) => {
          expect((store.reset as SinonSpy).callCount).to.equal(1);
        });
      });
    });

    describe('invalidate', () => {
      let storeSpies: {[key: string]: SinonSpy};

      beforeEach(() => {
        storeSpies = {};

        each(refStoreMap.__map, (store: Store) => {
          storeSpies[store.definition.type] = spy(store, 'invalidate');
        });
      });

      describe('with store only argument', () => {
        it('should properly invalidate matching store types', () => {
          refStoreMap.invalidate('user');

          expect(storeSpies['account'].callCount).to.equal(0);
          expect(storeSpies['project'].callCount).to.equal(0);
          expect(storeSpies['user'].callCount).to.equal(1);
          expect(storeSpies['user'].getCall(0).args).to.deep.equal([{}]);
        });

        it('should properly invalidate matching store objects', () => {
          const stores = refStoreMap.__map;
          refStoreMap.invalidate(stores['user']);

          expect(storeSpies['account'].callCount).to.equal(0);
          expect(storeSpies['project'].callCount).to.equal(0);
          expect(storeSpies['user'].callCount).to.equal(1);
          expect(storeSpies['user'].getCall(0).args).to.deep.equal([{}]);
        });

        it('should properly invalidate matching stores', () => {
          const stores = refStoreMap.__map;
          refStoreMap.invalidate([stores['user'], 'project']);

          expect(storeSpies['account'].callCount).to.equal(0);
          expect(storeSpies['project'].callCount).to.equal(1);
          expect(storeSpies['project'].getCall(0).args).to.deep.equal([{}]);
          expect(storeSpies['user'].callCount).to.equal(1);
          expect(storeSpies['user'].getCall(0).args).to.deep.equal([{}]);
        });
      });

      describe('with option only argument', () => {
        it('should properly invalidate all stores', () => {
          refStoreMap.invalidate({ foo: 123 });

          each(refStoreMap.__map, (store: Store) => {
            expect(storeSpies[store.definition.type].callCount).to.equal(1);
            expect(storeSpies[store.definition.type].getCall(0).args).to.deep.equal([{ foo: 123 }]);
          });
        });
      });
    });

    describe('add', () => {
      describe('with invalid arguments', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            refStoreMap.add();
          }).to.throw(Error, 'can only be of type Store but found type');

          expect(() => {
            // @ts-ignore
            refStoreMap.add('foo');
          }).to.throw(Error, 'can only be of type Store but found type');
        });
      });

      describe('with a store argument', () => {
        it('should throw an error when not unique', () => {
          refStoreMap.add(new Store('foo'));

          expect(() => {
            refStoreMap.add(new Store('foo'));
          }).to.throw(RangeError, 'has already been previously mapped for');
        });

        it('should properly add', () => {
          const store = new Store('foo');

          expect(refStoreMap.__map['foo']).to.equal(undefined);

          refStoreMap.add(store);

          expect(refStoreMap.__map['foo']).to.equal(store);
        });
      });
    });

    describe('getOrCreate', () => {
      describe('with invalid arguments', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            refStoreMap.getOrCreate(123);
          }).to.throw(Error, 'can only be of type String but found type');

          expect(() => {
            // @ts-ignore
            refStoreMap.getOrCreate(new Store('foo'));
          }).to.throw(Error, 'can only be of type String but found type');
        });
      });

      describe('with no arguments', () => {
        it('should return a random store', () => {
          const store1 = refStoreMap.getOrCreate();
          const store2 = refStoreMap.getOrCreate();

          expect(store1).to.be.an.instanceof(Store);
          expect(store2).to.be.an.instanceof(Store);
          expect(store1).to.not.equal(store2);
        });
      });

      describe('with a string argument', () => {
        it('should return proper store', () => {
          const store = new Store('foo');

          expect(refStoreMap.getOrCreate('project')).to.equal(refStoreMap.__map['project']);

          refStoreMap.add(store);
          expect(refStoreMap.getOrCreate('foo')).to.equal(store);
        });
      });
    });
  });
});
