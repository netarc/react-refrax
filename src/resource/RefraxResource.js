/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const RefraxOptions = require('RefraxOptions');
const RefraxResourceBase = require('RefraxResourceBase');
const invokeDescriptor = require('invokeDescriptor');
const STATUS_STALE = RefraxConstants.status.STALE;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
// WeakMap offers a ~743% performance boost (~0.55ms => ~0.074ms) per fetch
const ResourceMap = new WeakMap();


/**
 * RefraxResource is a public facing interface class to querying a Schema Node.
 */
class RefraxResource extends RefraxResourceBase {
  static from(accessor, ...args) {
    return new RefraxResource(accessor, ...args);
  }

  get timestamp() {
    var result = ResourceMap.get(this) || this._fetch();
    return result.timestamp;
  }

  get status() {
    var result = ResourceMap.get(this) || this._fetch();
    return result.status;
  }

  get data() {
    var result = ResourceMap.get(this) || this._fetch();
    return result.data;
  }

  constructor(accessor, ...args) {
    super(accessor, ...args);

    Object.defineProperty(this, '_disposers', {value: []});

    this._generateDescriptor((descriptor) => {
      // NOTE: we invalidate before potentially subscribing
      if (this._options.invalidate) {
        // shortcut for no options
        if (this._options.invalidate === true) {
          this._options.invalidate = {noPropagate: true};
        }

        this.invalidate(this._options.invalidate);
      }

      if (this._options.noSubscribe !== true && descriptor.store) {
        this._disposers.push(
          descriptor.store.subscribe(descriptor.event, (event) => {
            // If we are an item resource and we encounter a destroy event, we switch on the
            // 'no fetching' option so we can still passively poll the data but not cause a re-fetch
            if (descriptor.classify === CLASSIFY_ITEM && event.action === 'destroy') {
              this._options.noFetchGet = true;
            }

            this._fetchCache();

            if (event.noPropagate !== true) {
              this.emit('change', this, event);
            }
          })
        );
      }

      this._fetchCache();
    });
  }

  _dispose() {
    ResourceMap.delete(this);

    RefraxTools.each(this._disposers, function(disposer) {
      disposer();
    });
    this._disposers.length = 0;

    return this;
  }

  _fetch() {
    return this._generateDescriptor((descriptor) => {
      return invokeDescriptor.fetch(descriptor, {
        noFetchGet: this._options.noFetchGet
      });
    });
  }

  _fetchCache() {
    var result = this._fetch();

    ResourceMap.set(this, result);
    return result;
  }

  invalidate(options) {
    const descriptorOptions = new RefraxOptions({ errorOnInvalid: !!options.errorOnInvalid });

    this._generateDescriptor(null, descriptorOptions, (descriptor) => {
      if (descriptor.store) {
        descriptor.store.invalidate(descriptor, options);
      }

      if (options.cascade === true) {
        options = RefraxTools.extend({}, options, { errorOnInvalid: false });

        this._accessor.enumerateLeafs((key, accessor) => {
          accessor.invalidate(options);
        });
      }
    });
  }

  isLoading() {
    return this.timestamp === TIMESTAMP_LOADING;
  }

  isStale() {
    return this.status === STATUS_STALE;
  }

  hasData() {
    return !!this.data;
  }
}

export default RefraxResource;
