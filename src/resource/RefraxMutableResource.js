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
const invokeDescriptor = require('invokeDescriptor');
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_UPDATE = RefraxConstants.action.update;
const ACTION_DELETE = RefraxConstants.action.delete;


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

  create(...data) {
    return this._generateDescriptor(ACTION_CREATE, data, (descriptor) => {
      return invokeDescriptor(descriptor, this._options);
    });
  }

  destroy(...data) {
    return this._generateDescriptor(ACTION_DELETE, data, (descriptor) => {
      return invokeDescriptor(descriptor, this._options);
    });
  }

  update(...data) {
    return this._generateDescriptor(ACTION_UPDATE, data, (descriptor) => {
      return invokeDescriptor(descriptor, this._options);
    });
  }
}

export default RefraxMutableResource;
