/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxConstants = require('RefraxConstants');
const RefraxTools = require('RefraxTools');
const RefraxOptions = require('RefraxOptions');
const RefraxResourceBase = require('RefraxResourceBase');
const ACTION_GET = RefraxConstants.action.get;
const STATUS_STALE = RefraxConstants.status.stale;
const STATUS_COMPLETE = RefraxConstants.status.complete;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
// WeakMap offers a ~743% performance boost (~0.55ms => ~0.074ms) per fetch
const ResourceMap = new WeakMap();


/**
 * RefraxResource is a public facing interface class to querying a Schema Node.
 */
class RefraxResource extends RefraxResourceBase {
  static from(schemaPath, ...args) {
    return new RefraxResource(schemaPath, ...args);
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

  constructor(schemaPath, ...args) {
    super(schemaPath, ...args);

    this.onDispose(() => {
      ResourceMap.delete(this);
      this._disposeSubscriber && this._disposeSubscriber();
    });

    this._generateDescriptor(ACTION_GET, (descriptor, options) => {
      this._dispatchLoad = (data) => {
        if (data) {
          this._dispatchLoad = null;
          this.emit('load', this, {
            type: descriptor.store.definition.type
          });
        }
      };

      // NOTE: we invalidate before potentially subscribing
      if (options.invalidate) {
        this.invalidate(options.invalidate);
      }

      if (options.noSubscribe !== true && descriptor.store) {
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

      // 'touch' actions that originate from ourself come from `_fetchFragment` so we can
      // safely ignore them as that implicitly updates our cache state
      if (event.action === 'touch' && event.invoker === this) {
        return;
      }

      // If we are an item resource and we encounter a destroy event, we switch on the
      // 'no fetching' option so we can still passively poll the data but not cause a re-fetch
      if (descriptor.classify === CLASSIFY_ITEM && event.action === 'destroy') {
        this._options.noFetchGet = true;
      }

      this._updateCache({
        noPropagate: !!event.noPropagate,
        noFetchGet: !!event.noFetchGet
      });

      if (event.noPropagate !== true) {
        this.emit('change', this, event);
      }
    };

    subscriber();
  }

  _fetchFragment(options = {}) {
    const fragment = this.fetch(RefraxTools.extend({}, options, {
      fragmentOnly: true
    }));

    ResourceMap.set(this, fragment || {});

    return fragment;
  }

  _updateCache(options = {}) {
    const fragment = this._fetchFragment(options);

    if (this._dispatchLoad && fragment && fragment.status === STATUS_COMPLETE) {
      this._dispatchLoad(fragment.data);
    }
  }

  invalidate(options = {}) {
    const descriptorOptions = new RefraxOptions({ errorOnInvalid: !!options.errorOnInvalid });

    this._generateDescriptor(ACTION_GET, [descriptorOptions], options, (descriptor, options) => {
      if (descriptor.store) {
        descriptor.store.invalidate(descriptor, options);
      }

      if (options.cascade === true) {
        this._schemaPath.invalidateLeafs(options);
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
