/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxConfig = require('RefraxConfig');
const RefraxStore = require('RefraxStore');
const RefraxStoreMap = require('RefraxStoreMap');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxPath = require('RefraxPath');
const RefraxOptions = require('RefraxOptions');
const RefraxConstants = require('RefraxConstants');
const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const STRATEGY_MERGE = RefraxConstants.strategy.merge;
const STRATEGY_REPLACE = RefraxConstants.strategy.replace;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;
const CLASSIFY_ITEM = RefraxConstants.classify.item;

const GlobalStoreMap = new RefraxStoreMap();

// simple-depth serialize to avoid circular references for error debugging
function serializer() {
  var stack = [];

  return function(key, value) {
    if (stack.length > 0) {
      if (stack.indexOf(this) === -1 && typeof(value) === 'object') {
        return '...';
      }
    }
    else {
      stack.push(value);
    }

    return value;
  };
}

function fillURI(uri, params, paramMap) {
  var vars = uri.match(/:(\w+)/g) || []
    , lastParamKey = null
    , i, v, value
    , errors = [];

  for (i = 0; i < vars.length; i++) {
    v = vars[i];

    lastParamKey = v.substr(1);
    if (paramMap && paramMap[lastParamKey]) {
      lastParamKey = paramMap[lastParamKey];
    }

    if ((value = params[lastParamKey])) {
      uri = uri.replace(v, value);
    }
    else {
      errors.push(lastParamKey);
      uri = uri.replace(v, ':' + lastParamKey);
    }
  }

  return {
    lastParamKey: lastParamKey,
    uri: uri,
    errors: errors
  };
}

function encodeURIValue(value) {
  if (RefraxTools.isPlainObject(value)) {
    value = JSON.stringify(value);
  }

  return global.encodeURIComponent(value);
}

function encodeURIData(data) {
  var result = [];

  RefraxTools.each(data || [], function(value, key) {
    if (RefraxTools.isArray(value)) {
      RefraxTools.each(value, function(v) {
        result.push(key + '[]=' + encodeURIValue(v));
      });
    }
    else {
      result.push(key + '=' + encodeURIValue(value));
    }
  });

  return result.length > 0
    ? '?' + result.join('&')
    : '';
}

function resetScope(resourceDescriptor, resolver) {
  resourceDescriptor.store = null;
  resourceDescriptor.type = null;
  resourceDescriptor.classify = CLASSIFY_RESOURCE;
  resourceDescriptor.partial = FRAGMENT_DEFAULT;
  resourceDescriptor.fragments = [];

  resolver.paramId = null;
}

function resolveOptions(resourceDescriptor, resolver, options) {
  if (options.store) {
    resourceDescriptor.store = options.store;
  }

  if (options.paramMap) {
    RefraxTools.extend(resolver.paramMap, options.paramMap);
  }

  if (options.paramId) {
    resolver.paramId = resolver.paramId;
  }

  resourceDescriptor.partial = options.partial || FRAGMENT_DEFAULT;
  resourceDescriptor.fragments = options.fragments || [];

  if (options.cacheStrategy) {
    resourceDescriptor.cacheStrategy = options.cacheStrategy;
  }

  if (options.collectionStrategy) {
    resourceDescriptor.collectionStrategy = options.collectionStrategy;
  }

  if (typeof(options.errorOnInvalid) === 'boolean') {
    resolver.errorOnInvalid = options.errorOnInvalid;
  }

  if (RefraxTools.isFunction(options.paramsGenerator)) {
    RefraxTools.extend(resourceDescriptor.params, options.paramsGenerator());
  }

  if (RefraxTools.isObject(options.params)) {
    RefraxTools.extend(resourceDescriptor.params, options.params);
  }
}

/**
 * Given a stack representing a path in our Schema tree and options affecting it, we
 * reduce and resolve it down to a descriptor describing a resource.
 */
function processStack(resourceDescriptor, stack) {
  var action = resourceDescriptor.action
    , resolver = {
      errorOnInvalid: action !== 'inspect',
      paramMap: {},
      path: [],
      paramId: null,
      queryParams: {},
      appendPaths: [],
      storeMap: GlobalStoreMap
    }
    , pathErrors = []
    , i, item, definition
    , lastURIParamId = null
    , key, result;

  // Pass 1
  for (i = 0; i < stack.length; i++) {
    item = stack[i];
    if (!item) {
      throw new TypeError('processStack: Found null stack element at index ' + i + ' from stack ' + JSON.stringify(stack));
    }

    if (item instanceof RefraxSchemaNode) {
      if (item.type !== CLASSIFY_ITEM) {
        resetScope(resourceDescriptor, resolver);
      }

      resourceDescriptor.classify = item.type;

      if (item.definition.storeMap) {
        resolver.storeMap = item.definition.storeMap;
      }

      resolveOptions(resourceDescriptor, resolver, item.definition);
    }
    else if (item instanceof RefraxOptions) {
      resolveOptions(resourceDescriptor, resolver, item);
    }
    else if (item instanceof RefraxParameters) {
      RefraxTools.extend(resourceDescriptor.params, item);
    }
    else if (item instanceof RefraxQueryParameters) {
      RefraxTools.extend(resolver.queryParams, item);
    }
    else if (item instanceof RefraxPath) {
      resolver.appendPaths.push(item);
    }
    else if (RefraxTools.isPlainObject(item)) {
      RefraxTools.extend(resourceDescriptor.payload, item);
    }
    else {
      throw new TypeError('processStack: Uknown stack object `' + item + '`');
    }
  }

  if (typeof(resourceDescriptor.store) === 'string' &&
      resolver.storeMap instanceof RefraxStoreMap) {
    resourceDescriptor.store = resolver.storeMap.getOrCreate(resourceDescriptor.store);
  }

  if (resourceDescriptor.store instanceof RefraxStore) {
    resourceDescriptor.type = resourceDescriptor.store.definition.type;
  }
  else {
    resourceDescriptor.store = null;
  }

  // Pass 2 - Since URI uses resolved params we need to do it separately
  for (i = 0; i < stack.length; i++) {
    item = stack[i];
    definition = item.definition;

    if (item instanceof RefraxSchemaNode) {
      result = null;

      if (definition.path) {
        result = fillURI(definition.path, resourceDescriptor.params, resolver.paramMap);
      }
      else if (definition.paramId) {
        result = fillURI(':'+definition.paramId, resourceDescriptor.params, resolver.paramMap);
      }

      if (result) {
        pathErrors = pathErrors.concat(result.errors);
        resolver.path.push(result.uri);
        lastURIParamId = result.lastParamKey;
      }
    }
  }

  resolver.appendPaths = RefraxTools.map(RefraxTools.select(resolver.appendPaths, function(rPath) {
    return rPath.isModifier || (resolver.path.push(rPath.path) && false);
  }), function(rPath) {
    return rPath.path;
  });

  // If we have no base path's ignore pathing all together
  if (resolver.path.length > 0) {
    resourceDescriptor.basePath =
      resourceDescriptor.path = RefraxConfig.hostname + '/' + resolver.path.join('/');

    if (resolver.appendPaths.length > 0) {
      resourceDescriptor.path+= '/' + resolver.appendPaths.join('/');
    }

    if (action === ACTION_GET) {
      // NOTE: we append QueryParams to both basePath & path since basePath is typically used
      //  for cache query reference and path is used as the actual request path
      resolver.queryParams = encodeURIData(resolver.queryParams);
      resourceDescriptor.basePath+= resolver.queryParams;
      resourceDescriptor.path+= resolver.queryParams;
    }
  }

  resolver.paramId = resolver.paramId || lastURIParamId || 'id';
  if (resolver.paramMap[resolver.paramId]) {
    resolver.paramId = resolver.paramMap[resolver.paramId];
  }

  resourceDescriptor.id = (resourceDescriptor.id = resourceDescriptor.params[resolver.paramId]) &&
                          ('' + resourceDescriptor.id) || null;
  resourceDescriptor.event = resourceDescriptor.id || resourceDescriptor.basePath || 'change';

  resourceDescriptor.fragments = resourceDescriptor.fragments.reverse();

  if (pathErrors.length > 0) {
    resourceDescriptor.valid = false;

    if (resolver.errorOnInvalid) {
      throw new TypeError(
        'Failed to map path: `' + resourceDescriptor.path + '` using params: ' +
        JSON.stringify(resourceDescriptor.params, serializer())
      );
    }
  }
}

class RefraxResourceDescriptor {
  static storeMap = GlobalStoreMap;

  constructor(action = ACTION_GET, stack = []) {
    this.action = action;
    this.event = null;
    this.classify = CLASSIFY_RESOURCE;
    this.partial = FRAGMENT_DEFAULT;
    this.id = null;
    this.params = {};
    this.fragments = [];
    this.payload = {};
    this.store = null;
    this.type = null;
    this.cacheStrategy = STRATEGY_REPLACE;
    this.collectionStrategy = action === ACTION_CREATE ? STRATEGY_MERGE : STRATEGY_REPLACE;
    this.valid = true;

    if (!RefraxTools.isArray(stack)) {
      stack = [stack];
    }

    processStack(this, stack);
  }

  // Using our own descriptor's rules, grab an id from an object
  idFrom(target) {
    // TODO: id map?
    return target && target.id && ('' + target.id);
  }
}

export default RefraxResourceDescriptor;
