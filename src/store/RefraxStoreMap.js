/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { each, isPlainObject, isArray, randomString } from 'RefraxTools';
import RefraxStore from 'RefraxStore';


class RefraxStoreMap {
  constructor() {
    this.__map = {};
  }

  add(store) {
    if (!(store instanceof RefraxStore)) {
      throw new TypeError(
        `RefraxStore.set - \`store\` can only be of type RefraxStore but found type \`${typeof(store)}\`.`
      );
    }

    // This store already exists so just return it
    if (this.__map[store.definition.type] === store) {
      return store;
    }

    if (this.__map[store.definition.type] !== undefined) {
      throw new RangeError(
        `RefraxStore.set - \`type\` has already been previously mapped for \`${store.definition.type}\``
      );
    }

    this.__map[store.definition.type] = store;

    return store;
  }

  getOrCreate(type) {
    var store = null;

    if (type) {
      if (typeof(type) !== 'string') {
        throw new TypeError(
          `RefraxStore.get - \`type\` can only be of type String but found type \`${typeof(type)}\`.`
        );
      }

      store = this.__map[type] || null;
    }
    else {
      // Specifying no type name will fill a random string
      while (this.__map[(type = randomString(12))]) {}
    }

    if (!store) {
      store = this.__map[type] = new RefraxStore({type: type});
    }

    return store;
  }

  reset() {
    each(this.__map, function(store) {
      store.reset();
    });
  }

  invalidate(stores, options = {}) {
    if (isPlainObject(stores)) {
      options = stores;
      stores = null;
    }

    if (typeof(stores) === 'string' || stores instanceof RefraxStore) {
      stores = [stores];
    }

    if (isArray(stores)) {
      each(stores, (store) => {
        each(this.__map, (mapStore) => {
          if ((typeof(store) === 'string' && store === mapStore.definition.type) ||
              store === mapStore) {
            mapStore.invalidate(options);
          }
        });
      });
    }
    else {
      each(this.__map, (mapStore) => {
        mapStore.invalidate(options);
      });
    }
  }
}

export default RefraxStoreMap;
