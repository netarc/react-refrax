/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Promise = require('bluebird');
const mixinSubscribable = require('mixinSubscribable');
const mixinMutable = require('mixinMutable');
const RequestError = require('RequestError');
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxTools = require('RefraxTools');

class ActionInvoker {
  constructor(action) {
    Object.defineProperty(this, '_action', {value: action});
  }

  mutableFrom(accessor, ...args) {
    const action = this._action;
    const stack = [].concat(
      action._options,
      action._parameters,
      action._queryParams,
      args
    );

    return RefraxMutableResource.from(accessor, ...stack);
  }

  invalidate(items, options) {
    const action = this._action;
    items = [].concat(items || []);

    RefraxTools.each(items, (item) => {
      item
        .withParams(action._parameters)
        .withQueryParams(action._queryParams)
        .invalidate(options);
    });
  }
}

class RefraxActionEntity {
  constructor(method) {
    this._method = method;
    this._promises = [];

    mixinSubscribable(this);
    mixinMutable(this);
  }

  toString() {
    return 'RefraxActionEntity => ' + this._method.toString();
  }

  invoke(Action, args) {
    const options = Action._options;
    const stack = Action._stack;
    const stackSize = stack.length;
    const invoker = new ActionInvoker(Action);
    var promise, result, i;

    // reset errors on invocation
    Action.setErrors({});
    const data = RefraxTools.extend(
      {},
      options.includeDefault === true ? Action.getDefault() : null,
      this._state,
      args.shift()
    );

    for (i=0; i<stackSize; i++) {
      stack[i]._promises.push(invoker);
      stack[i].emit('start', invoker);
    }

    promise = result = this._method.apply(invoker, [data].concat(args));

    if (!RefraxTools.isPromise(result)) {
      promise = new Promise(function(resolve, reject) {
        if (result instanceof Error) {
          reject(result);
        }
        else {
          resolve(result);
        }
      });
    }

    function finalize() {
      for (i=0; i<stackSize; i++) {
        const n = stack[i]._promises.indexOf(invoker);
        if (n > -1) {
          stack[i]._promises.splice(n, 1);
        }
        stack[i].emit('finish', invoker);
      }
    }
    promise.then((result) => {
      this.unset();
      finalize();
      return result;
    });
    promise.catch((err) => {
      if (err instanceof RequestError) {
        if (RefraxTools.isPlainObject(err.response.data)) {
          Action.setErrors(RefraxTools.extend({}, err.response.data));
        }
      }

      finalize();
      throw err;
    });

    return promise;
  }
}

export default RefraxActionEntity;
