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
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;


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
function processRequestSuccess(descriptor, response, options) {
  var data = response && response.data;

  if (!descriptor.store) {
    return;
  }

  // Successfull response but no data.. so lets default to an empty value accordingly
  if (!data) {
    if (descriptor.classify === CLASSIFY_COLLECTION) {
      data = [];
    }
    else {
      data = {};
    }
  }

  if (descriptor.action === ACTION_GET) {
    processResponse(data, descriptor);
  }
  else if (descriptor.action === ACTION_DELETE) {
    descriptor.store.destroyResource(descriptor, options);
  }
  else {
    descriptor.store.updateResource(descriptor, data, STATUS_COMPLETE, options);
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

function invokeDescriptor(descriptor, options = {}) {
  var store = descriptor.store
    , touchParams = {
      timestamp: TIMESTAMP_LOADING
    }
    , requestConfig = {
      method: descriptor.action,
      url: descriptor.path
    };

  if (descriptor.action === ACTION_GET) {
    touchParams.status = STATUS_STALE;
  }
  else {
    requestConfig.data = descriptor.payload;

    if (containsMultipart(requestConfig.data)) {
      requestConfig.data = composeFormData(requestConfig.data);
    }
  }

  if (store) {
    store.touchResource(descriptor, touchParams, options);
  }

  return new Promise(function(resolve, reject) {
    // eslint-disable-next-line new-cap
    Axios(requestConfig)
      .then(function(response) {
        processRequestSuccess(descriptor, response, options);
        const resource = store && store.fetchResource(descriptor) || {};
        resource.response = response;
        resolve(resource);
      }, function(err) {
        if (store) {
          store.touchResource(descriptor, {timestamp: Date.now()}, options);
        }
        reject(new RequestError(err.response));
      });
  });
}

export default invokeDescriptor;
