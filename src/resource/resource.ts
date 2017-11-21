/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { SchemaPath } from '../schema/path';
import { FragmentResult } from '../store/fragmentResult';
import { Store } from '../store/store';
import { RefraxOptions } from '../util/composableHash';
import { Disposable } from '../util/disposable';
import {
  IActionType ,
  IClassification,
  IKeyValue,
  IStatus,
  IStoreEvent,
  ITimestamp,
  TRequestResult,
  TResourceArgument
} from '../util/types';
import { BaseResource } from './base';
import { ResourceDescriptor } from './descriptor';
import { requestForDescriptor } from './requestForDescriptor';

// WeakMap offers a ~743% performance boost (~0.55ms => ~0.074ms) per fetch
const ResourceMap = new WeakMap();

/**
 * Resource is a public facing interface class to querying a Schema Node.
 */
export class Resource extends BaseResource {
  static from(schemaPath: SchemaPath, ...args: any[]): Resource {
    return new Resource(schemaPath, ...args);
  }

  _dispatchLoad: ((data: any) => void) | null;

  get timestamp(): number {
    const result = ResourceMap.get(this) || this._fetchFragment();

    return result.timestamp;
  }

  get status(): string {
    const result = ResourceMap.get(this) || this._fetchFragment();

    return result.status;
  }

  get data(): IKeyValue | Array<IKeyValue | string | number> {
    const result = ResourceMap.get(this) || this._fetchFragment();

    return result.data;
  }

  constructor(schemaPath: SchemaPath, ...args: TResourceArgument[]) {
    super(schemaPath, ...args);

    this.addDisposable(new Disposable((): void => {
      ResourceMap.delete(this);
    }));

    this._generateDescriptor(IActionType.get, (descriptor: ResourceDescriptor, options: IKeyValue = {}) => {
      this._dispatchLoad = (data: any) => {
        if (data) {
          this._dispatchLoad = null;
          this.emit('load', this, {
            type: (descriptor.store as Store).definition.type
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

  _subscribeToStore(descriptor: ResourceDescriptor): void {
    const onEvent = (event: IKeyValue) => {
      // 'touch' actions that originate from ourself come from `_fetchFragment` so we can
      // safely ignore them as that implicitly updates our cache state
      if (event.action === IStoreEvent.touch && event.invoker === this) {
        return;
      }

      // If we are an item resource and we encounter a destroy event, we switch on the
      // 'no fetching' option so we can still passively poll the data but not cause a re-fetch
      if (descriptor.classify === IClassification.item && event.action === IStoreEvent.destroy) {
        this._options.noFetchGet = true;
      }

      this._updateCache({
        noPropagate: Boolean(event.noPropagate),
        noFetchGet: Boolean(event.noFetchGet)
      });

      if (event.noPropagate !== true) {
        this.emit('change', this, event);
      }
    };

    if (descriptor.store) {
      this.addDisposable(descriptor.store.on(descriptor.event!, onEvent));
    }
  }

  _fetchFragment(options: IKeyValue = {}): FragmentResult {
    const doRequest = (descriptor: ResourceDescriptor, _options: IKeyValue): FragmentResult | null => {
      const store = descriptor.store;

      if (!store) {
        return null;
      }

      let result = store.fetchResource(descriptor);

      if (_options.noFetchGet !== true && result.timestamp < ITimestamp.loading) {
        requestForDescriptor(descriptor, _options);
        result = store.fetchResource(descriptor);
      }

      return result;
    };

    const fragment = this._generateDescriptor(IActionType.get, options, doRequest) || new FragmentResult();
    ResourceMap.set(this, fragment);

    return fragment;
  }

  get(): Promise<TRequestResult> {
    return this._generateDescriptor(IActionType.get, requestForDescriptor);
  }

  /*
  // @todo Promisify?
  fetch(options: IKeyValue = {}): null | FragmentResult | Promise<TRequestResult> {
    // tslint:disable-next-line: no-shadowed-variable
    const doRequest = (descriptor: ResourceDescriptor, options: IKeyValue):
        null | FragmentResult | Promise<TRequestResult> => {
      const store = descriptor.store;
      let promise: Promise<TRequestResult> | null = null;

      if (!store) {
        return options.fragmentOnly === true ?
          null : Promise.reject(new Error('No store associated with resource'));
      }

      let result = store.fetchResource(descriptor);

      if (options.noFetchGet !== true && result.timestamp < ITimestamp.loading) {
        promise = requestForDescriptor(descriptor, options);
        result = store.fetchResource(descriptor);
      }

      if (options.fragmentOnly === true) {
        return result;
      }

      return promise || Promise.resolve<TRequestResult>([result, null, descriptor]);
    };

    return this._generateDescriptor(IActionType.get, options, doRequest);
  }
  */

  _updateCache(options: IKeyValue = {}): void {
    const fragment = this._fetchFragment(options);

    if (this._dispatchLoad && fragment && fragment.status === IStatus.complete) {
      this._dispatchLoad(fragment.data);
    }
  }

  invalidate(options: IKeyValue = {}): void {
    const descriptorOptions = new RefraxOptions({ errorOnInvalid: Boolean(options.errorOnInvalid) });
    const doInvalidate = (descriptor: ResourceDescriptor, opts: IKeyValue): void => {
      if (descriptor.store) {
        descriptor.store.invalidate(descriptor, opts);
      }

      if (opts.cascade === true) {
        this._schemaPath.invalidateLeafs(opts);
      }
    };

    this._generateDescriptor(IActionType.get, options, [descriptorOptions], doInvalidate);
  }

  isLoading(): boolean {
    return this.timestamp === ITimestamp.loading;
  }

  isStale(): boolean {
    return this.status === IStatus.stale;
  }

  hasData(): boolean {
    return Boolean(this.data);
  }
}
