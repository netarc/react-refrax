/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  each,
  invariant,
  isArray,
  isPlainObject,
  randomString
} from 'util/tools';
import { IKeyValue } from 'util/types';
import { Store } from './store';

const RandomUIDSize = 12;
export class StoreMap {
  __map: {[key: string]: Store};

  constructor() {
    this.__map = {};
  }

  add(store: Store): Store {
    invariant(store instanceof Store,
      `Store.add - \`store\` can only be of type Store but found type \`${typeof(store)}\`.`
    );

    // This store already exists so just return it
    if (this.__map[store.definition.type] === store) {
      return store;
    }

    if (this.__map[store.definition.type] !== undefined) {
      throw new RangeError(
        `Store.set - \`type\` has already been previously mapped for \`${store.definition.type}\``
      );
    }

    this.__map[store.definition.type] = store;

    return store;
  }

  getOrCreate(type?: string): Store {
    let store = null;

    if (!type) {
      // Specifying no type name will fill a random string
      // tslint:disable-next-line:no-empty
      while (this.__map[(type = randomString(RandomUIDSize))]) {}
    }

    invariant(typeof(type) === 'string',
      `Store.get - \`type\` can only be of type String but found type \`${typeof(type)}\`.`
    );

    if (!(store = this.__map[type])) {
      store = this.__map[type] = new Store({ type });
    }

    return store;
  }

  reset(): void {
    each(this.__map, (store: Store) => {
      store.reset();
    });
  }

  invalidate(options: IKeyValue): void;
  invalidate(store: string | Store): void;
  invalidate(stores: string | Store | IKeyValue | Array<string | Store>, options: IKeyValue = {}): void {
    if (isPlainObject(stores)) {
      options = stores as IKeyValue;
      stores = null!;
    }

    if (typeof(stores) === 'string' || stores instanceof Store) {
      stores = [stores];
    }

    if (isArray(stores)) {
      each(stores, (store: string | Store) => {
        each(this.__map, (mapStore: Store) => {
          if (store === mapStore || store === mapStore.definition.type) {
            mapStore.invalidate(options);
          }
        });
      });
    }
    else {
      each(this.__map, (mapStore: Store) => {
        mapStore.invalidate(options);
      });
    }
  }
}
