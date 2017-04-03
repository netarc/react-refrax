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
const RefraxTreeNode = require('RefraxTreeNode');
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
const CLASSIFY_INVALID = RefraxConstants.classify.invalid;


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

/**
 * Given a stack representing a path in our Schema tree and options affecting it, we
 * reduce and resolve it down to a descriptor describing a resource.
 */
function processStack(resourceDescriptor, stack) {
  var action = resourceDescriptor.action
    , errorOnInvalid = action !== 'inspect'
    , resolvedParamMap = {}
    , resolvedPath = []
    , resolvedParamId = null
    , resolvedQueryParams = {}
    , resolvedAppendPaths = []
    , pathErrors = []
    , i, item, definition
    , lastURIParamId = null
    , key, result;

  if (!stack) {
    throw new TypeError('generateDescriptor: expected non-null stack');
  }

  // Pass 1
  for (i = 0; i < stack.length; i++) {
    item = stack[i];
    if (!item) {
      throw new TypeError('generateDescriptor: Found null stack element at index ' + i + ' from stack ' + JSON.stringify(stack));
    }

    definition = item.definition;

    if (item instanceof RefraxStore) {
      // every store encounter is considered a hard scope change
      resourceDescriptor.store = item;
      resolvedParamId = definition.paramId || null;
      resourceDescriptor.type = definition.type;
      resourceDescriptor.classify = CLASSIFY_RESOURCE;
      resourceDescriptor.partial = FRAGMENT_DEFAULT;
      resourceDescriptor.fragments = [];
    }
    else if (item instanceof RefraxTreeNode) {
      resourceDescriptor.classify = item.type;

      if (definition.paramMap) {
        resolvedParamMap = RefraxTools.extend(resolvedParamMap, definition.paramMap);
      }

      if (definition.paramId) {
        resolvedParamId = resolvedParamId;
      }

      resourceDescriptor.partial = definition.partial || FRAGMENT_DEFAULT;
      resourceDescriptor.fragments = definition.fragments || [];
    }
    else if (item instanceof RefraxOptions) {
      if (item.cacheStrategy) {
        resourceDescriptor.cacheStrategy = item.cacheStrategy;
      }

      if (item.collectionStrategy) {
        resourceDescriptor.collectionStrategy = item.collectionStrategy;
      }

      if (typeof(item.errorOnInvalid) === 'boolean') {
        errorOnInvalid = item.errorOnInvalid;
      }
    }
    else if (item instanceof RefraxParameters) {
      RefraxTools.extend(resourceDescriptor.params, item);
    }
    else if (item instanceof RefraxQueryParameters) {
      resolvedQueryParams = RefraxTools.extend(resolvedQueryParams, item);
    }
    else if (item instanceof RefraxPath) {
      resolvedAppendPaths.push(item);
    }
    else if (RefraxTools.isPlainObject(item)) {
      RefraxTools.extend(resourceDescriptor.payload, item);
    }
  }

  // Pass 2 - Since URI uses resolved params we need to do it separately
  for (i = 0; i < stack.length; i++) {
    item = stack[i];
    definition = item.definition;

    if (item instanceof RefraxTreeNode) {
      result = null;

      if (definition.uri) {
        result = fillURI(definition.uri, resourceDescriptor.params, resolvedParamMap);
      }
      else if (definition.paramId) {
        result = fillURI(':'+definition.paramId, resourceDescriptor.params, resolvedParamMap);
      }

      if (result) {
        pathErrors = pathErrors.concat(result.errors);
        resolvedPath.push(result.uri);
        lastURIParamId = result.lastParamKey;
      }
    }
  }

  resolvedAppendPaths = RefraxTools.map(RefraxTools.select(resolvedAppendPaths, function(rPath) {
    return rPath.isModifier || resolvedPath.push(rPath.path);
  }), function(rPath) {
    return rPath.path;
  });

  // If we have no base path's ignore pathing all together
  if (resolvedPath.length > 0) {
    resourceDescriptor.basePath =
      resourceDescriptor.path = RefraxConfig.hostname + '/' + resolvedPath.join('/');

    if (resolvedAppendPaths.length > 0) {
      resourceDescriptor.path+= '/' + resolvedAppendPaths.join('/');
    }

    if (action === ACTION_GET) {
      // NOTE: we append QueryParams to both basePath & path since basePath is typically used
      //  for cache query reference and path is used as the actual request path
      resolvedQueryParams = encodeURIData(resolvedQueryParams);
      resourceDescriptor.basePath+= resolvedQueryParams;
      resourceDescriptor.path+= resolvedQueryParams;
    }
  }

  key = resolvedParamId || lastURIParamId || 'id';
  if (resolvedParamMap[key]) {
    key = resolvedParamMap[key];
  }
  resolvedParamId = (resolvedParamId = resourceDescriptor.params[key]) &&
                    ('' + resolvedParamId);

  resourceDescriptor.event = ['change'].concat(resolvedParamId || []).join(':');
  resourceDescriptor.id = resolvedParamId;
  resourceDescriptor.fragments = resourceDescriptor.fragments.reverse();

  if (pathErrors.length > 0) {
    resourceDescriptor.valid = false;

    if (errorOnInvalid) {
      throw new TypeError(
        'Failed to map path: `' + resourceDescriptor.path + '` using params: ' +
        JSON.stringify(resourceDescriptor.params, serializer())
      );
    }
  }
}

class RefraxResourceDescriptor {
  constructor(action = ACTION_GET, stack = []) {
    this.action = action;
    this.event = ['change'];
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
