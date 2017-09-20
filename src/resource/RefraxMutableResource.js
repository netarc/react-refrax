/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxResourceBase = require('RefraxResourceBase');
const RefraxConstants = require('RefraxConstants');
const RefraxPath = require('RefraxPath');
const RefraxTools = require('RefraxTools');
const requestForDescriptor = require('requestForDescriptor');
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_UPDATE = RefraxConstants.action.update;
const ACTION_DELETE = RefraxConstants.action.delete;

const spliceCallback = (array) => {
  let len = array.length
    , callback = null;

  for (let i=0; i<len; i++) {
    const arg = array[i];

    if (RefraxTools.isFunction(arg)) {
      callback = arg;
      array.splice(i, 1);
      len-= 1;
    }
  }

  return callback;
};

/**
 * RefraxMutableResource is a public facing interface class to modifying through a Schema Node.
 */
class RefraxMutableResource extends RefraxResourceBase {
  static from(schemaPath, ...args) {
    return new RefraxMutableResource(schemaPath, ...args);
  }

  constructor(schemaPath, ...args) {
    // Mutable path modifiers do not count as the basePath
    args = RefraxTools.map(args, function(arg) {
      if (typeof(arg) === 'string') {
        arg = new RefraxPath(arg, true);
      }
      return arg;
    });

    super(schemaPath, ...args);
  }

  create(...args) {
    const callback = spliceCallback(args);

    return this._generateDescriptor(ACTION_CREATE, args, (descriptor, options) => {
      return requestForDescriptor(descriptor, options, callback);
    });
  }

  destroy(...args) {
    const callback = spliceCallback(args);

    return this._generateDescriptor(ACTION_DELETE, args, (descriptor, options) => {
      return requestForDescriptor(descriptor, options, callback);
    });
  }

  update(...args) {
    const callback = spliceCallback(args);

    return this._generateDescriptor(ACTION_UPDATE, args, (descriptor, options) => {
      return requestForDescriptor(descriptor, options, callback);
    });
  }
}

export default RefraxMutableResource;
