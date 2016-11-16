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
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxOptions = require('RefraxOptions');
const RefraxTools = require('RefraxTools');

class ActionInvoker {
  constructor(action) {
    Object.defineProperty(this, '_action', {value: action});
  }

  mutableFrom(accessor, ...args) {
    const action = this._action;

    return RefraxMutableResource.from(accessor,
      new RefraxOptions(action._options.resource),
      action._parameters,
      action._queryParams,
      ...args);
  }

  invalidate(items, options) {
    options = RefraxTools.extend({
      params: this._action._parameters
    }, this._action._options.resource, options);
    items = [].concat(items || []);

    RefraxTools.each(items, (item) => item.invalidate(options));
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
    const entity = stack[stackSize-1];
    var promise, result, i;

    // reset errors on invocation
    Action.errors = {};
    const data = RefraxTools.extend(
      {},
      options.includeDefault === true ? Action.getDefault() : null,
      this._state,
      args.shift()
    );

    for (i=0; i<stackSize; i++) {
      stack[i]._promises.push(invoker);
    }
    for (i=0; i<stackSize; i++) {
      stack[i].emit('start', invoker);
    }

    promise = result = this._method.apply(invoker, [data].concat(args));

    if (!RefraxTools.isPromise(result)) {
      promise = new Promise(function(resolve, reject) {
        resolve(result);
      });
    }

    promise.catch(function(err) {
      if (RefraxTools.isPlainObject(err.response.data)) {
        Action.errors = RefraxTools.extend({}, err.response.data);
        entity.emit('mutated', {
          type: 'errors'
        });
      }
    });

    function finalize() {
      for (i=0; i<stackSize; i++) {
        const n = stack[i]._promises.indexOf(invoker);
        if (n > -1) {
          stack[i]._promises.splice(n, 1);
        }
      }
      for (i=0; i<stackSize; i++) {
        stack[i].emit('finish', invoker);
      }
    }
    promise.then(finalize, finalize);

    return promise;
  }
}

export default RefraxActionEntity;
