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
const RefraxSchemaNodeAccessor = require('RefraxSchemaNodeAccessor');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const ACTION_GET = RefraxConstants.action.get;


/**
 * RefraxResource is a public facing interface class to querying a Schema Node.
 */
class RefraxResourceBase {
  constructor(accessor, ...args) {
    var i, arg
      , options = new RefraxOptions()
      , queryParams = new RefraxQueryParameters()
      , parameters = new RefraxParameters()
      , paths = [];

    if (!(accessor instanceof RefraxSchemaNodeAccessor)) {
      throw new TypeError(
        'RefraxResourceBase expected valid SchemaNodeAccessor\n\r' +
        'found: `' + accessor + '`'
      );
    }

    for (i=0; i<args.length; i++) {
      arg = args[i];
      if (arg === undefined || arg === null) {
        continue;
      }
      else if (typeof(arg) === 'string') {
        paths.push(new RefraxPath(arg));
      }
      else if (arg instanceof RefraxPath) {
        paths.push(arg);
      }
      else if (arg instanceof RefraxOptions) {
        RefraxTools.extend(options, arg);
      }
      else if (arg instanceof RefraxParameters) {
        RefraxTools.extend(parameters, arg);
      }
      else if (arg instanceof RefraxQueryParameters ||
               RefraxTools.isPlainObject(arg)) {
        RefraxTools.extend(queryParams, arg);
      }
      else {
        console.warn('RefraxResourceBase: unexpected argument `' + arg + '` passed to constructor.');
      }
    }

    mixinSubscribable(this);

    Object.defineProperty(this, '_accessor', {value: accessor});
    Object.defineProperty(this, '_paths', {value: paths});
    Object.defineProperty(this, '_options', {value: options});
    Object.defineProperty(this, '_parameters', {value: parameters});
    Object.defineProperty(this, '_queryParams', {value: queryParams});
  }

  // helper methods for a more idiomatic chaining approach

  options(options) {
    RefraxOptions.validate(options);
    RefraxTools.extend(this._options, options);
    return this;
  }

  params(params) {
    RefraxParameters.validate(params);
    RefraxTools.extend(this._parameters, params);
    return this;
  }

  queryParams(params) {
    RefraxQueryParameters.validate(params);
    RefraxTools.extend(this._queryParams, params);
    return this;
  }

  //

  _generateStack() {
    var stack = [];

    if (this._options.paramsGenerator) {
      stack.push(new RefraxParameters(this._options.paramsGenerator()));
    }

    if (this._options.params) {
      stack.push(new RefraxParameters(this._options.params));
    }

    return [].concat(
      this._accessor.__stack,
      this._paths,
      this._parameters,
      this._queryParams,
      this._options,
      stack
    );
  }

  _generateDescriptor(action, data, onValid) {
    if (RefraxTools.isFunction(action)) {
      onValid = action;
      action = null;
    }

    const stack = this._generateStack().concat(data || []);
    const descriptor = new RefraxResourceDescriptor(action || ACTION_GET, stack);

    if (!onValid) {
      return descriptor;
    }

    return descriptor.valid && onValid(descriptor);
  }
}

export default RefraxResourceBase;
