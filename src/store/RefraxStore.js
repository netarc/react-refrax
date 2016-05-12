/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxFragmentCache = require('RefraxFragmentCache');
const mixinSubscribable = require('mixinSubscribable');
const StoreMap = {};


/**
 * A RefraxStore is a wrapper around the RefraxFragmentCache object that offers
 * a Subscribable interface to resource mutations.
 */
class RefraxStore {
  static get(type) {
    var store;

    if (type) {
      if (typeof(type) !== 'string') {
        throw new TypeError(
          'RefraxStore.get - `type` can only be of type String but found type `' + typeof(type) + '`.'
        );
      }

      store = StoreMap[type];
      if (!store) {
        store = StoreMap[type] = new RefraxStore({type: type});
      }
    }
    else {
      // an anonymous store still has a type for reference
      while (StoreMap[(type = RefraxTools.randomString(12))]) {}
      store = StoreMap[type] = new RefraxStore({type: type});
    }

    return store;
  }

  static reset() {
    RefraxTools.each(StoreMap, function(store) {
      store.reset();
    });
  }

  constructor(definition) {
    mixinSubscribable(this);

    this.definition = definition;
    this.reset();
  }

  reset() {
    this.cache = new RefraxFragmentCache();
  }

  invalidate(opts) {
    opts = opts || {};

    this.cache.invalidate(opts);

    if (opts.notify) {
      this.emit('change');
    }
  }

  //

  notifyChange(resourceDescriptor) {
    console.info('Store::notifyChange(%o) notify[%i]', this.definition.type, resourceDescriptor.id);
    this.emit('change');
    if (resourceDescriptor.id) {
      this.emit('change:' + resourceDescriptor.id);
    }
  }

  // Fragment Map is intentionally separate to allow future switching depending
  // on the need; this concept may change.

  fetchResource(resourceDescriptor) {
    return this.cache.fetch(resourceDescriptor);
  }

  touchResource(resourceDescriptor, data, noNotify) {
    this.cache.touch(resourceDescriptor, data);
    if (!noNotify) {
      this.notifyChange(resourceDescriptor);
    }
  }

  updateResource(resourceDescriptor, data, status) {
    this.cache.update(resourceDescriptor, data, status);
    this.notifyChange(resourceDescriptor);
  }

  deleteResource(resourceDescriptor) {
    this.cache.remove(resourceDescriptor);
    this.notifyChange(resourceDescriptor);
  }
}

Object.defineProperty(RefraxStore, 'all', {value: StoreMap});

export default RefraxStore;