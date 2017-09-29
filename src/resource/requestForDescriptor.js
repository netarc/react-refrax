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
const RequestError = require('RequestError');
const RefraxConstants = require('RefraxConstants');
const processResponse = require('processResponse');
const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const ACTION_GET = RefraxConstants.action.get;


// We only quietly consume RequestError's
Promise.onPossiblyUnhandledRejection(function(err, promise) {
  if (err instanceof RequestError) {
    return;
  }
  throw err;
});

function containsMultipart(data) {
  return data && RefraxTools.any(data, function(value) {
    return global.File && value instanceof global.File;
  });
}

function composeFormData(data) {
  var result = new global.FormData();

  RefraxTools.each(data, function(value, key) {
    result.append(key, value);
  });

  return result;
}

function requestForDescriptor(descriptor, options = {}, callback = null) {
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

  let promise = new Promise(function(resolve, reject) {
    // eslint-disable-next-line new-cap
    Axios(requestConfig)
      .then(function(response) {
        resolve([response.data, response, descriptor]);
      }, function(err) {
        // Convert errors that look like Axios request errors into Refrax request errors
        if ('request' in err && 'response' in err) {
          reject(new RequestError(err.response));
        }
        else {
          reject(err);
        }
      });
  });

  // Callback acts as a way to inject into our request and modify the result or
  // perform some action before the result feeds into processResponse.
  if (callback) {
    promise = promise.then(([data, response, descriptor]) => {
      let result = callback(data, response, descriptor);

      if (result === undefined) {
        result = data;
      }
      // If our result is a promise, lets chain off it to ensure we return the expected tuple
      else if (RefraxTools.isPromise(result)) {
        return result.then((data) => {
          return [data, response, descriptor];
        });
      }

      return [result, response, descriptor];
    });
  }

  return promise
    .then(([data, response, descriptor]) => {
      processResponse(data, descriptor, null, options);

      const result = store && store.fetchResource(descriptor) || {};

      return [result, response, descriptor];
    })
    // We deliberately catch after our processResponse so we can more gracefully
    // reset to a finished state (timestamp)
    .catch((err) => {
      if (store) {
        store.touchResource(descriptor, { timestamp: Date.now() }, options);
      }
      throw err;
    });
}

export default requestForDescriptor;
