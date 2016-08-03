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
 * RefraxMutableResource is a public facing interface class to querying a Schema Node.
 */
class RefraxMutableResource extends RefraxResourceBase {
  static from(accessor, ...args) {
    return new RefraxMutableResource(accessor, ...args);
  }

  constructor(accessor, ...args) {
    // Mutable path modifiers do not count as the basePath
    args = RefraxTools.map(args, function(arg) {
      if (typeof(arg) === 'string') {
        arg = new RefraxPath(arg, true);
      }
      return arg;
    });

    super(accessor, ...args);
  }

  create(...data) {
    return invokeDescriptor(this._generateDescriptor(ACTION_CREATE, data), this._options);
  }

  destroy(...data) {
    return invokeDescriptor(this._generateDescriptor(ACTION_DELETE, data), this._options);
  }

  update(...data) {
    return invokeDescriptor(this._generateDescriptor(ACTION_UPDATE, data), this._options);
  }
}

export default RefraxMutableResource;
