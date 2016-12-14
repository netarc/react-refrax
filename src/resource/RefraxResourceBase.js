/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Promise = require('bluebird');
const mixinSubscribable = require('mixinSubscribable');
const mixinConfigurable = require('mixinConfigurable');
const mixinDisposable = require('mixinDisposable');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxPath = require('RefraxPath');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const invokeDescriptor = require('invokeDescriptor');
const ACTION_GET = RefraxConstants.action.get;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;


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

    if (!(accessor instanceof RefraxSchemaPath)) {
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

    Object.defineProperty(this, '_accessor', {value: accessor});
    Object.defineProperty(this, '_paths', {value: paths});

    mixinDisposable(this);
    this.onDispose(mixinSubscribable.asDisposable(this));
    mixinConfigurable(this, {
      _options: options,
      _parameters: parameters,
      _queryParams: queryParams
    });
  }

  //

  get() {
    return this._generateDescriptor((descriptor) => {
      return invokeDescriptor(descriptor, this._options);
    });
  }

  fetch(options = {}) {
    return this._generateDescriptor((descriptor) => {
      const store = descriptor.store;
      var result = null
        , promise = null;

      if (!store) {
        return options.fragmentOnly === true && result ||
          Promise.reject(new Error('No store associated with resource'));
      }

      result = store.fetchResource(descriptor);

      if (this._options.noFetchGet !== true && result.timestamp < TIMESTAMP_LOADING) {
        promise = invokeDescriptor(descriptor, this._options);
        result = store.fetchResource(descriptor);
      }

      return options.fragmentOnly === true && result || promise || Promise.resolve(result);
    });
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
