/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Promise = require('bluebird');
const Axios = require('axios');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const processResponse = require('processResponse');
const STATUS_COMPLETE = RefraxConstants.status.COMPLETE;
const STATUS_STALE = RefraxConstants.status.STALE;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const ACTION_GET = RefraxConstants.action.get;
const ACTION_DELETE = RefraxConstants.action.delete;


// We only quietly consume RequestError's
Promise.onPossiblyUnhandledRejection(function(err, promise) {
  if (err instanceof RequestError) {
    return;
  }
  throw err;
});

function RequestError(response) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  }
  this.message = '' + response.statusText;
  this.response = response;
  this.name = 'RequestError';
}
RequestError.prototype = Object.create(Error.prototype);

/**
 * Given a known Store update a resource descriptors data and repeat with
 * any embedded data.
 */
function processRequestSuccess(resourceDescriptor, response, options) {
  var data = response && response.data;

  if (!resourceDescriptor.store) {
    return;
  }

  if (resourceDescriptor.action === ACTION_GET) {
    processResponse(data, resourceDescriptor);
  }
  else if (resourceDescriptor.action === ACTION_DELETE) {
    resourceDescriptor.store.destroyResource(resourceDescriptor, options);
  }
  else {
    resourceDescriptor.store.updateResource(resourceDescriptor, data, STATUS_COMPLETE, options);
  }
}

function containsMultipart(data) {
  return data && RefraxTools.any(data, function(value) {
    return value instanceof global.File;
  });
}

function composeFormData(data) {
  var result = new global.FormData();

  RefraxTools.each(data, function(value, key) {
    result.append(key, value);
  });

  return result;
}

function invokeDescriptor(resourceDescriptor, options = {}) {
  var store = resourceDescriptor.store
    , touchParams = {
      timestamp: TIMESTAMP_LOADING
    }
    , requestConfig = {
      method: resourceDescriptor.action,
      url: resourceDescriptor.path
    };

  if (resourceDescriptor.action === ACTION_GET) {
    touchParams.status = STATUS_STALE;
  }
  else {
    requestConfig.data = resourceDescriptor.payload;

    if (containsMultipart(requestConfig.data)) {
      requestConfig.data = composeFormData(requestConfig.data);
    }
  }

  if (store) {
    store.touchResource(resourceDescriptor, touchParams, options);
  }

  return new Promise(function(resolve, reject) {
    // eslint-disable-next-line new-cap
    Axios(requestConfig)
      .then(function(response) {
        processRequestSuccess(resourceDescriptor, response, options);
        const resource = store && store.fetchResource(resourceDescriptor) || {};
        resource.response = response;
        resolve(resource);
      }, function(err) {
        if (store) {
          store.touchResource(resourceDescriptor, {timestamp: Date.now()}, options);
        }
        reject(new RequestError(err.response));
      });
  });
}

export default invokeDescriptor;
