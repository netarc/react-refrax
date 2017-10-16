/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Promise from 'bluebird';
import mixinSubscribable from 'mixinSubscribable';
import mixinConfigurable from 'mixinConfigurable';
import RefraxDisposable from 'RefraxDisposable';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxQueryParameters from 'RefraxQueryParameters';
import RefraxPath from 'RefraxPath';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import RefraxSchemaPath from 'RefraxSchemaPath';
import { extend, isPlainObject, isFunction, isArray } from 'RefraxTools';
import RefraxConstants from 'RefraxConstants';
import requestForDescriptor from 'requestForDescriptor';

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
    options.extend(schemaPath._options);
    parameters.extend(schemaPath._parameters);
    queryParams.extend(schemaPath._queryParams);

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
               isPlainObject(arg)) {
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

    RefraxDisposable.mixinDisposable(this);
    mixinSubscribable(this);

    this.addDisposable(new RefraxDisposable(() => {
      this._emitter.removeAllListeners();
    }));

    // Cloning not supported
    mixinConfigurable(this, {
      _options: options,
      _parameters: parameters,
      _queryParams: queryParams
    });
  }

  //

  get() {
    return this._generateDescriptor(ACTION_GET, (descriptor, options) => {
      return requestForDescriptor(descriptor, options);
    });
  }

  fetch(options = {}) {
    return this._generateDescriptor(ACTION_GET, options, (descriptor, options) => {
      const store = descriptor.store;
      var result = null
        , promise = null;

      if (!store) {
        return options.fragmentOnly === true && result ||
          Promise.reject(new Error('No store associated with resource'));
      }

      result = store.fetchResource(descriptor);

      if (options.noFetchGet !== true && result.timestamp < TIMESTAMP_LOADING) {
        promise = requestForDescriptor(descriptor, options);
        result = store.fetchResource(descriptor);
      }

      if (options.fragmentOnly === true) {
        return result;
      }

      return promise || Promise.resolve([result, null, descriptor]);
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

  _generateDescriptor(action, ...args) {
    var stackAppend = []
      , options = null
      , onValid = null;

    while (args.length > 0) {
      const arg = args.pop();

      if (isFunction(arg)) {
        onValid = arg;
      }
      else if (isArray(arg)) {
        stackAppend = arg;
      }
      else if (isPlainObject(arg)) {
        options = arg;
      }
      else {
        throw new TypeError(
          '_generateDescriptor invalid argument found: `' + arg + '`'
        );
      }
    }

    const stack = this._generateStack().concat(stackAppend);
    const descriptor = new RefraxResourceDescriptor(this, action, stack);
    options = extend({}, this._options.compose(this), options, {
      invoker: this
    });

    if (!onValid) {
      return descriptor;
    }

    return descriptor.valid && onValid(descriptor, options);
  }
}

export default RefraxResourceBase;
