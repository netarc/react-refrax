/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxConstants = require('RefraxConstants');
const RefraxTools = require('RefraxTools');
const RefraxFragmentResult = require('RefraxFragmentResult');
const CACHE_STRATEGY_MERGE = RefraxConstants.cacheStrategy.merge;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const STATUS_COMPLETE = RefraxConstants.status.COMPLETE;
const STATUS_PARTIAL = RefraxConstants.status.PARTIAL;
const STATUS_STALE = RefraxConstants.status.STALE;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;


class RefraxFragmentCache {
  constructor() {
    this.fragments = {};
    this.queries = {};
  }

  /**
   * Will return a Stale resource when a given resource cannot be found by the
   * supplied descriptor.
   */
  fetch(descriptor) {
    var fragmentCache = this._getFragment(descriptor.partial)
      , resourceId = descriptor.id
      , result = null
      , resource = null
      , fragments, i, data, entry;

    result = new RefraxFragmentResult();

    if (resourceId) {
      resource = fragmentCache[resourceId];

      if (resource) {
        result.status = resource.status;
        result.timestamp = resource.timestamp;
        result.data = resource.data;
      }

      if (!result.data) {
        // Create a new list of fragments with our global default being last at highest priority.
        fragments = [].concat(descriptor.fragments, FRAGMENT_DEFAULT);

        for (i = 0; i < fragments.length; i++) {
          fragmentCache = this._getFragment(fragments[i])[resourceId];

          if (fragmentCache && fragmentCache.data) {
            result.data = RefraxTools.extend({}, result.data || {}, fragmentCache.data || {});
            result.status = STATUS_PARTIAL;
          }
        }
      }
    }
    else if (descriptor.basePath) {
      resource = this.queries[descriptor.basePath];
      if (resource) {
        result.status = resource.status;
        result.timestamp = resource.timestamp;
      }

      if (!resource || !(data = resource.data)) {
        return result;
      }

      if (descriptor.classify === CLASSIFY_COLLECTION) {
        result.data = RefraxTools.map(data || [], function(id) {
          var entry = fragmentCache[id];

          if (!entry) {
            throw new TypeError(
              'RefraxFragmentCache:fetch - Unexpected error, failure to find collection entry for `' + id + '`.'
            );
          }

          return RefraxTools.extend({}, entry.data);
        });
      }
      else if (descriptor.classify === CLASSIFY_ITEM) {
        entry = fragmentCache[data];
        if (!entry) {
          throw new TypeError(
            'RefraxFragmentCache:fetch - Unexpected error, failure to find entry for `' + data + '`.'
          );
        }

        result.data = RefraxTools.extend({}, entry.data);
      }
      else {
        if (RefraxTools.isArray(data)) {
          data = [].concat(data);
        }
        else if (RefraxTools.isObject(data)) {
          data = RefraxTools.extend({}, data);
        }

        result.data = data;
      }
    }

    // If we are expecting a collection let's ensure we are an array atleast
    if (!result.data && descriptor.classify === CLASSIFY_COLLECTION) {
      result.data = [];
    }

    return result;
  }

  /**
   * Update the metadata for a given resource.
   *
   * TODO: Maybe guard this more or change where metadata is stored as this method
   * could change the `data` property.
   */
  touch(descriptor, touch) {
    var fragmentCache = this._getFragment(descriptor.partial)
      , resourceId = descriptor.id;

    if (!touch) {
      return;
    }

    if (resourceId) {
      fragmentCache[resourceId] = RefraxTools.extend(fragmentCache[resourceId] || {}, touch);
    }
    else if (descriptor.basePath) {
      this.queries[descriptor.basePath] = RefraxTools.extend(this.queries[descriptor.basePath] || {}, touch);
    }
  }

  /**
   * Update the content for a given resource.
   */
  update(descriptor, data, status) {
    var self = this
      , fragmentCache = this._getFragment(descriptor.partial)
      , queryData
      , resourcePath = descriptor.basePath
      , result
      , touchedIds = []
      , dataId = null;

    // if no data is present (ie a 204 response) our data then becomes stale
    result = {
      status: status || STATUS_COMPLETE,
      timestamp: data ? Date.now() : TIMESTAMP_STALE
    };

    // Fragments
    if (descriptor.classify === CLASSIFY_COLLECTION && data) {
      if (!RefraxTools.isArray(data) && !RefraxTools.isPlainObject(data)) {
        throw new TypeError(
          'RefraxFragmentCache:update expected collection compatible type of Array/Object\n\r' +
          'basePath: ' + resourcePath + '\n\r' +
          'found: `' + typeof(data) + '`'
        );
      }

      if (RefraxTools.isArray(data)) {
        dataId = RefraxTools.map(data, function(item) {
          return self._updateFragmentCache(fragmentCache, descriptor, result, item, touchedIds);
        });
      }
      else {
        dataId = this._updateFragmentCache(fragmentCache, descriptor, result, data, touchedIds);
      }
    }
    else if (descriptor.classify === CLASSIFY_ITEM) {
      dataId = this._updateFragmentCache(fragmentCache, descriptor, result, data, touchedIds);
    }

    // Queries
    if (resourcePath) {
      queryData = this.queries[resourcePath] && this.queries[resourcePath].data;

      // from a REST perspective collections are typically modified when creating into them
      if (descriptor.classify === CLASSIFY_COLLECTION) {
        if (dataId) {
          if (descriptor.cacheStrategy === CACHE_STRATEGY_MERGE) {
            queryData = RefraxTools.concatUnique(queryData, dataId);
          }
          else {
            queryData = RefraxTools.isArray(dataId) ? dataId : [dataId];
          }
        }
        // if no data was received creating into a collection we can mark it as stale
        else {
          result.status = STATUS_STALE;
          result.timestamp = TIMESTAMP_STALE;
        }
      }
      else if (descriptor.classify === CLASSIFY_ITEM) {
        queryData = dataId;
      }
      else if (data) {
        if (descriptor.cacheStrategy === CACHE_STRATEGY_MERGE) {
          if (RefraxTools.isArray(queryData) || RefraxTools.isArray(data)) {
            queryData = RefraxTools.concatUnique(queryData, data);
          }
          else {
            queryData = RefraxTools.extend(queryData || {}, data);
          }
        }
        else {
          queryData = data;
        }
      }

      this.queries[resourcePath] = RefraxTools.extend({}, result, {
        data: queryData
      });
    }

    return touchedIds;
  }

  _updateFragmentCache(fragmentCache, descriptor, result, data, touchedIds) {
    var itemId
      , fragmentData
      , snapshot = null;

    if (data && !RefraxTools.isPlainObject(data)) {
      throw new TypeError(
        'RefraxFragmentCache:update expected collection item of type Object\n\r' +
        'basePath: ' + descriptor.basePath + '\n\r' +
        'classification: ' + descriptor.classify + '\n\r' +
        'found: `' + typeof(data) + '`'
      );
    }

    if (!(itemId = descriptor.idFrom(descriptor) || descriptor.idFrom(data))) {
      throw new TypeError(
        'RefraxFragmentCache:update could not resolve collection item id\n\r' +
        'basePath: ' + descriptor.basePath + '\n\r' +
        'classification: ' + descriptor.classify + '\n\r' +
        'found: `' + JSON.stringify(data) + '`'
      );
    }

    fragmentData = fragmentCache[itemId] && fragmentCache[itemId].data || {};
    if (touchedIds) {
      snapshot = JSON.stringify(fragmentData);
    }

    if (descriptor.cacheStrategy === CACHE_STRATEGY_MERGE) {
      fragmentData = RefraxTools.extend(fragmentData, data);
    }
    // default replace strategy
    else {
      fragmentData = data || fragmentData;
    }

    fragmentCache[itemId] = RefraxTools.extend({}, result, {
      data: fragmentData
    });

    if (touchedIds && JSON.stringify(fragmentData) != snapshot) {
      touchedIds.push(itemId);
    }

    return itemId;
  }

  /**
   * Invalidate all data
   *
   * NOTE: We opt to set value to undefined vs deleting the key itself due to
   * performance reasons (testing shows delete ~98% slower).
   */
  invalidate(descriptor, options = {}) {
    var clearData = !!options.clear
      , results = []
      , invalidator = function(item) {
        // not yet cached so we can skip
        if (!item) {
          return;
        }

        if (item.data && item.data.id) {
          results.push(item.data.id);
        }

        item.status = STATUS_STALE;
        item.timestamp = TIMESTAMP_STALE;
        if (clearData) {
          item.data = undefined;
        }
      };

    if (descriptor) {
      if (options.noQueries !== true) {
        RefraxTools.each(this.queries, function(query, path) {
          if (path === descriptor.basePath ||
              (descriptor.id &&
                 RefraxTools.isArray(query.data) &&
                 query.data.indexOf(descriptor.id) != -1)) {
            invalidator(query);
          }
        });
      }

      if (options.noFragments !== true && descriptor.id) {
        RefraxTools.each(this.fragments, function(fragment) {
          invalidator(fragment[descriptor.id]);
        });
      }
    }
    else {
      if (options.noQueries !== true) {
        RefraxTools.each(this.queries, invalidator);
      }

      if (options.noFragments !== true) {
        RefraxTools.each(this.fragments, function(fragment) {
          RefraxTools.each(fragment, invalidator);
        });
      }
    }

    return results;
  }

  /**
   * Delete the content for a given resource.
   *
   * NOTE: We opt to set value to undefined vs deleting the key itself due to
   * performance reasons (testing shows delete ~98% slower).
   */
  destroy(descriptor) {
    var fragmentCache = this._getFragment(descriptor.partial)
      , resourcePath = descriptor.basePath
      , resourceID = descriptor.id;

    if (resourceID) {
      if (!fragmentCache[resourceID]) {
        return;
      }

      fragmentCache[resourceID] = undefined;
      // Remove our-self from any collection queries we know about
      RefraxTools.each(this.queries, function(query, path) {
        if (RefraxTools.isArray(query.data)) {
          var i = query.data.indexOf(resourceID);

          if (i !== -1) {
            query.data.splice(i, 1);
          }
        }
      });
    }
    else if (resourcePath && this.queries[resourcePath]) {
      this.queries[resourcePath] = undefined;
    }
  }

  _getFragment(fragment) {
    return this.fragments[fragment] ||
          (this.fragments[fragment] = {});
  }
}

export default RefraxFragmentCache;
