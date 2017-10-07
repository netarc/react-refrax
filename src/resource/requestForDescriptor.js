/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Promise = require('bluebird');
const RefraxAdapter = require('RefraxAdapter');
const RefraxTools = require('RefraxTools');
const RequestError = require('RequestError');
const processResponse = require('processResponse');


// We only quietly consume RequestError's
Promise.onPossiblyUnhandledRejection(function(err, promise) {
  if (err instanceof RequestError) {
    return;
  }
  throw err;
});

function requestForDescriptor(descriptor, options = {}, callback = null) {
  const store = descriptor.store;

  if (!descriptor.adapter) {
    throw new ReferenceError('requestForDescriptor: no adapter specified');
  }
  else if (!(descriptor.adapter instanceof RefraxAdapter)) {
    throw new ReferenceError('requestForDescriptor: expected RefraxAdapter base but found `' +
      descriptor.adaptor.constructor.name + '`'
    );
  }

  let promise = descriptor.adapter.invoke(descriptor, options);

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
