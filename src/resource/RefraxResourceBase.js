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
  constructor(schemaPath, ...args) {
    var i, arg
      , options = new RefraxOptions()
      , queryParams = new RefraxQueryParameters()
      , parameters = new RefraxParameters()
      , paths = [];

    if (!(schemaPath instanceof RefraxSchemaPath)) {
      throw new TypeError(
        'RefraxResourceBase expected valid SchemaPath\n\r' +
        'found: `' + schemaPath + '`'
      );
    }

    // SchemaPath is a `mixinConfigurable`
    RefraxTools.extend(options, schemaPath._options);
    RefraxTools.extend(parameters, schemaPath._parameters);
    RefraxTools.extend(queryParams, schemaPath._queryParams);

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
        options.extend(arg);
      }
      else if (arg instanceof RefraxParameters) {
        parameters.extend(arg);
      }
      else if (arg instanceof RefraxQueryParameters ||
               RefraxTools.isPlainObject(arg)) {
        queryParams.extend(arg);
      }
      else {
        console.warn('RefraxResourceBase: unexpected argument `' + arg + '` passed to constructor.');
      }
    }

    // `invalidate: true` is an alias for `{ noPropgate: true }`
    if (options.invalidate === true) {
      options.invalidate = { noPropagate: true };
    }

    Object.defineProperty(this, '_schemaPath', {value: schemaPath});
    Object.defineProperty(this, '_paths', {value: paths});

    mixinDisposable(this);
    this.onDispose(mixinSubscribable.asDisposable(this));
    // Cloning not supported
    mixinConfigurable(this, {
      _options: options,
      _parameters: parameters,
      _queryParams: queryParams
    });
  }

  //

  get() {
    return this._generateDescriptor((descriptor, options) => {
      return invokeDescriptor(descriptor, options);
    });
  }

  fetch(options = {}) {
    return this._generateDescriptor(options, (descriptor, options) => {
      const store = descriptor.store;
      var result = null
        , promise = null;

      if (!store) {
        return options.fragmentOnly === true && result ||
          Promise.reject(new Error('No store associated with resource'));
      }

      result = store.fetchResource(descriptor);

      if (options.noFetchGet !== true && result.timestamp < TIMESTAMP_LOADING) {
        promise = invokeDescriptor(descriptor, options);
        result = store.fetchResource(descriptor);
      }

      return options.fragmentOnly === true && result || promise || Promise.resolve(result);
    });
  }

  //

  _generateStack() {
    return [].concat(
      this._schemaPath.__stack,
      this._paths,
      this._parameters,
      this._queryParams,
      this._options
    );
  }

  _generateDescriptor(...args) {
    var action = ACTION_GET
      , data = []
      , options = null
      , onValid = null;

    while (args.length > 0) {
      const arg = args.pop();

      if (typeof(arg) === 'string') {
        action = arg;
      }
      else if (RefraxTools.isFunction(arg)) {
        onValid = arg;
      }
      else if (RefraxTools.isArray(arg) || arg instanceof RefraxOptions) {
        data = arg;
      }
      else if (RefraxTools.isPlainObject(arg)) {
        options = arg;
      }
      else {
        throw new TypeError(
          '_generateDescriptor invalid argument found: `' + arg + '`'
        );
      }
    }

    const stack = this._generateStack().concat(data);
    const descriptor = new RefraxResourceDescriptor(this, action, stack);
    options = RefraxTools.extend({}, this._options.compose(this), options, {
      invoker: this
    });

    if (!onValid) {
      return descriptor;
    }

    return descriptor.valid && onValid(descriptor, options);
  }
}

export default RefraxResourceBase;
