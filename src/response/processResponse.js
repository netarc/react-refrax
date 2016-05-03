/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxConstants = require('RefraxConstants');
const RefraxStore = require('RefraxStore');
const parseNested = require('parseNested');
const parseUnnested = require('parseUnnested');
const STATUS_SUCCESS = RefraxConstants.status.SUCCESS;


function processResponse(data, resourceDescriptor, handler) {
  var result = (handler || processResponse.defaultHandler)(data, resourceDescriptor)
    , type = resourceDescriptor && resourceDescriptor.type || result.type
    , store;

  if (!type) {
    throw new TypeError(
      'processResponse: Failed to resolve data type.'
    );
  }

  store = RefraxStore.get(type);

  if (!resourceDescriptor) {
    resourceDescriptor = new RefraxResourceDescriptor([store]);
  }
  resourceDescriptor.type = type;
  resourceDescriptor.partial = resourceDescriptor.partial ||
                               result.partial ||
                               RefraxConstants.defaultFragment;

  store.updateResource(resourceDescriptor, result.data, STATUS_SUCCESS);
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
