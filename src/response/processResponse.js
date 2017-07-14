/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const parseNested = require('parseNested');
const parseUnnested = require('parseUnnested');
const STATUS_COMPLETE = RefraxConstants.status.COMPLETE;
const ACTION_DELETE = RefraxConstants.action.delete;


function processResponse(data, descriptor, handler = null, options = {}) {
  if (!(descriptor instanceof RefraxResourceDescriptor)) {
    throw new TypeError(
      'processResponse: descriptor of type `ResourceDescriptor` expected but found `' +
      typeof(descriptor) + '`.'
    );
  }

  if (RefraxTools.isPlainObject(handler)) {
    options = handler;
    handler = null;
  }

  handler = handler || processResponse.defaultHandler;
  if (!handler || typeof(handler) !== 'function') {
    throw new TypeError(
      'processResponse: expected handler `Function`, but found `' + typeof(handler) + '`.'
    );
  }

  if (!RefraxTools.isPlainObject(options)) {
    throw new TypeError(
      'processResponse: options of type `Object` expected but found `' + typeof(options) + '`.'
    );
  }

  const result = data && handler(data, descriptor) || {};

  if (result.type && result.type !== descriptor.type) {
    throw new TypeError(
      'processResponse: Type mismatch on processed data, expected `' + descriptor.type +
      '` but found `' + result.type + '`.'
    );
  }

  const store = descriptor.store;
  if (store) {
    if (descriptor.action === ACTION_DELETE) {
      store.destroyResource(descriptor, options);
    }
    else {
      store.updateResource(descriptor, result.data, STATUS_COMPLETE, options);
    }
  }
}

/**
 * responseHandler serves as a collection/object parser for the resulting JSON of
 * a request. This parser will gather objects and send them off the the associated
 * Store for storage.
 *
 * New handlers can be added and the default able to be changed so one can
 * customize how they expect their backend show data and how RPS imports that data.
 */
processResponse.handlers = {
  parseNested,
  parseUnnested
};

processResponse.defaultHandler = parseNested;

export default processResponse;
