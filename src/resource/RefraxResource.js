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
    var result = ResourceMap.get(this) || this._fetchFragment();
    return result.timestamp;
  }

  get status() {
    var result = ResourceMap.get(this) || this._fetchFragment();
    return result.status;
  }

  get data() {
    var result = ResourceMap.get(this) || this._fetchFragment();
    return result.data;
  }

  constructor(accessor, ...args) {
    super(accessor, ...args);

    this.onDispose(() => {
      ResourceMap.delete(this);
      this._disposeSubscriber && this._disposeSubscriber();
    });

    this._generateDescriptor((descriptor) => {
      this._dispatchLoad = (data) => {
        if (data) {
          this._dispatchLoad = null;
          this.emit('load', this, {
            type: descriptor.store.definition.type
          });
        }
      };

      // NOTE: we invalidate before potentially subscribing
      if (this._options.invalidate) {
        // shortcut for no options
        if (this._options.invalidate === true) {
          this._options.invalidate = {noPropagate: true};
        }

        this.invalidate(this._options.invalidate);
      }

      if (this._options.noSubscribe !== true && descriptor.store) {
        this._subscribeToStore(descriptor);
      }

      this._updateCache();
    });
  }

  _subscribeToStore(descriptor) {
    // We make use of .once instead of .subscribe so we remain weakly referenced
    const subscriber = () => {
      this._disposeSubscriber = descriptor.store.once(descriptor.event, onEvent);
    };

    const onEvent = (event) => {
      if (this.isDisposed) {
        return;
      }

      subscriber();

      // If we are an item resource and we encounter a destroy event, we switch on the
      // 'no fetching' option so we can still passively poll the data but not cause a re-fetch
      if (descriptor.classify === CLASSIFY_ITEM && event.action === 'destroy') {
        this._options.noFetchGet = true;
      }

      this._updateCache();

      if (event.noPropagate !== true) {
        this.emit('change', this, event);
      }
    };

    subscriber();
  }

  _fetchFragment() {
    return this.fetch({ fragmentOnly: true });
  }

  _updateCache() {
    const fragment = this._fetchFragment();

    this._dispatchLoad && this._dispatchLoad(fragment && fragment.data);
    ResourceMap.set(this, fragment);
  }

  invalidate(options = {}) {
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
