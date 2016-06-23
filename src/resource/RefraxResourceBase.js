/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const mixinSubscribable = require('mixinSubscribable');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxPath = require('RefraxPath');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const ACTION_GET = RefraxConstants.action.get;


/**
 * RefraxResource is a public facing interface class to querying a Schema Node.
 */
class RefraxResourceBase {
  constructor(accessor, ...args) {
    var i, arg
      , options = {}
      , stack = [];

    for (i=0; i<args.length; i++) {
      arg = args[i];
      if (arg === undefined || arg === null) {
        continue;
      }
      else if (typeof(arg) === 'string') {
        stack.push(new RefraxPath(arg));
      }
      else if (arg instanceof RefraxOptions) {
        RefraxTools.extend(options, arg);
      }
      else if (arg instanceof RefraxParameters ||
               arg instanceof RefraxPath) {
        stack.push(arg);
      }
      else if (RefraxTools.isPlainObject(arg)) {
        stack.push(new RefraxQueryParameters(arg));
      }
      else {
        console.warn('RefraxResourceBase: unexpected argument `' + arg + '` passed to constructor.');
      }
    }

    mixinSubscribable(this);

    Object.defineProperty(this, '_accessorStack', {value: accessor.__stack});
    Object.defineProperty(this, '_stack', {value: stack});
    Object.defineProperty(this, '_options', {value: options});
  }

  // helper methods for a more idiomatic chaining approach

  config(options) {
    RefraxTools.extend(this._options, options);
    return this;
  }

  params(params) {
    this._stack.push(new RefraxParameters(params));
    return this;
  }

  query(params) {
    this._stack.push(new RefraxQueryParameters(params));
    return this;
  }

  //

  _generateDescriptor(action, data) {
    var runtimeParams = [];

    if (this._options.paramsGenerator) {
      runtimeParams.push(new RefraxParameters(this._options.paramsGenerator()));
    }

    if (this._options.params) {
      runtimeParams.push(new RefraxParameters(this._options.params));
    }

    // params intentionally comes before our stack so paramsGenerator params
    // can get overridden if needed
    return new RefraxResourceDescriptor(action || ACTION_GET, [].concat(
      this._accessorStack,
      runtimeParams,
      this._stack,
      data || []
    ));
  }
}

export default RefraxResourceBase;
