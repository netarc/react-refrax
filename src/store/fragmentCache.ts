/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ResourceDescriptor } from 'resource/descriptor';
import RefraxConfig from 'util/config';
import {
  concatUnique,
  each,
  extend,
  invariant,
  isArray,
  isObject,
  isPlainObject,
  map
} from 'util/tools';
import { IClassification, IKeyValue, IStatus, IStrategy, ITimestamp } from 'util/types';
import { FragmentResult } from './fragmentResult';

export interface ICacheTouchResult {
  fragments: string[];
  queries: string[];
}

export interface ICacheEntry {
  // [key: string]: any;
  status: IStatus;
  timestamp: ITimestamp;
  data?: any;
}

// tslint:disable-next-line:no-empty-interface
export interface IFragmentEntry extends ICacheEntry {
}

// tslint:disable-next-line:no-empty-interface
export interface IQueryEntry extends ICacheEntry {
}

export interface IFragmentEntryMap {
  [key: string]: IFragmentEntry;
}

const deepCopy = (target: any): any =>
  JSON.parse(JSON.stringify(target || null));

export class FragmentCache {
  fragments: {[key: string]: IFragmentEntryMap};
  queries: {[key: string]: IQueryEntry};

  constructor() {
    this.fragments = {};
    this.queries = {};
  }

  /**
   * Will return a Stale resource when a given resource cannot be found by the
   * supplied descriptor.
   */
  fetch(descriptor: ResourceDescriptor): FragmentResult {
    const resourceId = descriptor.id;
    const result = new FragmentResult();

    if (resourceId) {
      this.fetchById(descriptor, resourceId, result);
    }
    else if (descriptor.basePath) {
      const fragmentMap = this._getFragment(descriptor.partial);
      const resource = this.queries[descriptor.basePath];
      let data;

      if (resource) {
        result.status = resource.status;
        result.timestamp = resource.timestamp;
      }

      if (!resource || !(data = resource.data)) {
        return result;
      }

      if (descriptor.classify === IClassification.collection) {
        result.data = map(data || [], (id: string) => {
          const entry = fragmentMap[id];

          invariant(Boolean(entry),
            `FragmentCache:fetch - Unexpected error, failure to find collection entry for \`${id}\`.`
          );

          return extend({}, entry.data);
        });
      }
      else if (descriptor.classify === IClassification.item) {
        const entry = fragmentMap[data];

        invariant(Boolean(entry),
          `FragmentCache:fetch - Unexpected error, failure to find entry for \`${data}\`.`
        );

        result.data = extend({}, entry.data);
      }
      else {
        if (isArray(data)) {
          data = ([] as any[]).concat(data);
        }
        else if (isObject(data)) {
          data = extend({}, data);
        }

        result.data = data;
      }
    }

    // If we are expecting a collection let's ensure we are an array atleast
    if (!result.data && descriptor.classify === IClassification.collection) {
      result.data = [];
    }

    return result;
  }

  fetchById(descriptor: ResourceDescriptor, resourceId: string, result: FragmentResult): void {
    const fragmentMap = this._getFragment(descriptor.partial);
    const resource = fragmentMap[resourceId];

    if (resource) {
      result.status = resource.status;
      result.timestamp = resource.timestamp;
      result.data = deepCopy(resource.data);
    }

    if (!result.data) {
      result.fragments = [];

      // Create a new list of fragments with our global default being last at highest priority.
      const fragments = ([] as string[]).concat(descriptor.fragments, RefraxConfig.defaultFragment);
      for (const fragment of fragments) {
        const fragmentEntry = this._getFragment(fragment)[resourceId];
        if (fragmentEntry && fragmentEntry.data) {
          result.data = extend(result.data || {}, fragmentEntry.data);
          result.status = IStatus.partial;
          result.fragments.push(fragment);
        }
      }
    }
  }

  /**
   * Update the metadata for a given resource.
   *
   * TODO: Maybe guard this more or change where metadata is stored as this method
   * could change the `data` property.
   */
  touch(descriptor: ResourceDescriptor, touch?: IKeyValue): ICacheTouchResult {
    const fragmentMap = this._getFragment(descriptor.partial);
    const result: ICacheTouchResult = {
      fragments: [],
      queries: []
    };

    if (touch) {
      const resourceId = descriptor.id;
      const resourcePath = descriptor.basePath;

      if (resourceId) {
        fragmentMap[resourceId] = extend(fragmentMap[resourceId] || {}, touch);
        result.fragments.push(resourceId);
      }
      else if (resourcePath) {
        this.queries[resourcePath] = extend(this.queries[resourcePath] || {}, touch);
        result.queries.push(resourcePath);
      }
    }

    return result;
  }

  /**
   * Update the content for a given resource.
   *
   * @param descriptor - The requesting descriptor.
   * @param data - Inbound partial or complete data.
   * @param status - The status of the data in this request.
   */
  update(descriptor: ResourceDescriptor, data?: any, status?: IStatus): ICacheTouchResult {
    const fragmentMap = this._getFragment(descriptor.partial);
    const resourcePath = descriptor.basePath;
    const result: ICacheTouchResult = {
      fragments: [],
      queries: []
    };
    let ids: string | string[] | null = null;

    // if no data is present (ie a 204 response) our data then becomes stale
    const entry: IFragmentEntry = {
      status: status || IStatus.complete,
      timestamp: data ? Date.now() : ITimestamp.stale
    };

    // Fragments
    if (descriptor.classify === IClassification.collection && data) {
      invariant(isArray(data) || isPlainObject(data),
        'FragmentCache:update expected collection compatible type of Array/Object' +
        `basePath: ${resourcePath}` +
        `found: \`${typeof(data)}\``
      );

      if (isArray(data)) {
        ids = map(data, (item: any) =>
          this._updateFragmentMapEntry(descriptor, fragmentMap, entry, item, result.fragments));
      }
      else {
        ids = this._updateFragmentMapEntry(descriptor, fragmentMap, entry, data, result.fragments);
      }
    }
    else if (descriptor.classify === IClassification.item) {
      ids = this._updateFragmentMapEntry(descriptor, fragmentMap, entry, data, result.fragments);
    }

    // Queries
    if (descriptor.basePath) {
      this.updateQueryCache(descriptor, entry, ids, data, result.queries);
    }

    return result;
  }

  _updateFragmentMapEntry(descriptor: ResourceDescriptor,
                          fragmentMap: IFragmentEntryMap,
                          entry: IFragmentEntry,
                          data: any,
                          touchedFragments: string[]): string {
    let itemId: string;
    let fragmentData;
    let snapshot = null;

    invariant(!data || isPlainObject(data),
      'FragmentCache:update expected collection item of type Object' +
      `basePath: ${descriptor.basePath}` +
      `classification: ${descriptor.classify}` +
      `found: \`${typeof(data)}\``
    );

    invariant(Boolean(itemId = (ResourceDescriptor.idFrom(descriptor) || ResourceDescriptor.idFrom(data))!),
      'FragmentCache:update could not resolve collection item id' +
      `basePath: ${descriptor.basePath}` +
      `classification: ${descriptor.classify}` +
      `found: \`${typeof(data)}\``
    );

    fragmentData = fragmentMap[itemId] && fragmentMap[itemId].data || {};
    snapshot = JSON.stringify(fragmentData);

    if (descriptor.cacheStrategy === IStrategy.merge) {
      fragmentData = extend(fragmentData, data);
    }
    // default replace strategy
    else {
      fragmentData = data || fragmentData;
    }

    fragmentMap[itemId] = extend({}, entry, {
      data: fragmentData
    });

    if (JSON.stringify(fragmentData) !== snapshot) {
      touchedFragments.push(itemId);
    }

    return itemId;
  }

  updateQueryCache(descriptor: ResourceDescriptor,
                   entry: IFragmentEntry,
                   ids: string | string[] | null,
                   data: any,
                   touchedQueries: string[]): void {
    const resourcePath = descriptor.basePath;
    let queryData = this.queries[resourcePath] && this.queries[resourcePath].data;
    touchedQueries.push(resourcePath);

    if (descriptor.classify === IClassification.collection) {
      if (ids) {
        if (descriptor.collectionStrategy === IStrategy.merge) {
          queryData = concatUnique(queryData, ids);
        }
        else {
          queryData = isArray(ids) ? ids : [ids];
        }
      }
      // if no data was received modifying a collection we can mark it as stale
      else {
        entry.status = IStatus.stale;
        entry.timestamp = ITimestamp.stale;
      }
    }
    else if (descriptor.classify === IClassification.item) {
      // When updating an item, go through all queries we may be part of a collection of
      each(this.queries, (query: IFragmentEntry, path: string) => {
        if ((isArray(query.data) &&
             query.data.indexOf(ids) !== -1)) {
          touchedQueries.push(path);
        }
      });

      queryData = ids;
    }
    else if (data) {
      if (descriptor.cacheStrategy === IStrategy.merge) {
        if (isArray(queryData) || isArray(data)) {
          queryData = concatUnique(queryData, data);
        }
        else {
          queryData = extend(queryData || {}, data);
        }
      }
      else {
        queryData = data;
      }
    }

    this.queries[resourcePath] = extend({}, entry, {
      data: queryData
    });
  }

  /**
   * Invalidate all data
   *
   * NOTE: We opt to set value to undefined vs deleting the key itself due to
   * performance reasons (testing shows delete ~98% slower).
   */
  invalidate(descriptor?: ResourceDescriptor | null, options: IKeyValue = {}): ICacheTouchResult {
    const clearData = Boolean(options.clear);
    const result: ICacheTouchResult = {
      fragments: [],
      queries: []
    };
    const invalidator = (entry: ICacheEntry) => {
      // not yet cached so we can skip
      if (!entry) {
        return;
      }

      if (entry.data && entry.data.id) {
        result.fragments.push('' + entry.data.id);
      }

      entry.status = IStatus.stale;
      entry.timestamp = ITimestamp.stale;
      if (clearData) {
        entry.data = undefined;
      }
    };

    if (descriptor) {
      if (options.noQueries !== true) {
        each(this.queries, (query: IQueryEntry, path: string) => {
          const queryUrl = path.split('?')[0];

          // We compare descriptor base path against a query param stripped cache path
          // This will allow us to invalidate a root path and catch all queries but if our
          // descriptor was more specific and had query params then it wouldn't match
          if (path === descriptor.basePath ||
              queryUrl === descriptor.basePath ||
              (descriptor.id && isArray(query.data) && query.data.indexOf(descriptor.id) !== -1)) {
            result.queries.push(path);
            invalidator(query);
          }
        });
      }

      if (options.noFragments !== true && descriptor.id) {
        each(this.fragments, (fragmentMap: IFragmentEntryMap) => {
          invalidator(fragmentMap[descriptor.id!]);
        });
      }
    }
    else {
      if (options.noQueries !== true) {
        each(this.queries, (query: IQueryEntry, path: string) => {
          result.queries.push(path);
          invalidator(query);
        });
      }

      if (options.noFragments !== true) {
        each(this.fragments, (fragmentMap: IFragmentEntryMap) => {
          each(fragmentMap, invalidator);
        });
      }
    }

    return result;
  }

  /**
   * Delete the content for a given resource.
   *
   * NOTE: We opt to set value to undefined vs deleting the key itself due to
   * performance reasons (testing shows delete ~98% slower).
   */
  destroy(descriptor: ResourceDescriptor): ICacheTouchResult {
    const fragmentMap = this._getFragment(descriptor.partial);
    const resourcePath = descriptor.basePath;
    const resourceID = descriptor.id;
    const result: ICacheTouchResult = {
      fragments: [],
      queries: []
    };

    if (resourceID) {
      if (fragmentMap[resourceID]) {
        result.fragments.push(resourceID);
        fragmentMap[resourceID] = undefined!;
        // Remove our-self from any collection queries we know about
        each(this.queries, (query: IQueryEntry, path: string) => {
          if (isArray(query.data)) {
            const i = query.data.indexOf(resourceID);

            if (i !== -1) {
              result.queries.push(path);
              query.data.splice(i, 1);
            }
          }
        });
      }
    }
    else if (resourcePath && this.queries[resourcePath]) {
      this.queries[resourcePath] = undefined!;
      result.queries.push(resourcePath);
    }

    return result;
  }

  _getFragment(fragment: string): IFragmentEntryMap {
    return this.fragments[fragment] ||
      (this.fragments[fragment] = {});
  }
}
