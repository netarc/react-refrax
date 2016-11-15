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
const mixinConfigurable = require('mixinConfigurable');
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxOptions = require('RefraxOptions');
const RefraxResource = require('RefraxResource');
const RefraxTools = require('RefraxTools');
const prototypeAction = {};


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

class ActionEntity {
  constructor(method) {
    this._method = method;
    this._promises = [];

    mixinSubscribable(this);
  }

  toString() {
    return 'ActionEntity => ' + this._method.toString();
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
      Action._state,
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

const MixinAction = {
  getDefault: function() {
    var result = this._options.default || {};

    if (RefraxTools.isFunction(result)) {
      result = result();
    }

    if (result instanceof RefraxResource) {
      result = result.data || {};
    }
    else if (!RefraxTools.isPlainObject(result)) {
      throw new TypeError('ActionInstance ' + this + ' failed to resolve default value');
    }

    return result;
  },
  clone: function() {
    return _createAction(this._stack, this);
  }
};

const MixinStatus = {
  isPending: function() {
    return this._entity._promises.length > 0;
  },
  isLoading: function() {
    var _default = this._options.default;
    return _default && typeof(_default.isLoading) === 'function' && _default.isLoading();
  },
  hasData: function() {
    var _default = this._options.default;
    return _default && typeof(_default.hasData) === 'function' && _default.hasData()
      || !!this.getDefault();
  },
  isStale: function() {
    var _default = this._options.default;
    return _default && typeof(_default.isStale) === 'function' && _default.isStale();
  }
};

function _createAction(stack, from = null) {
  const entity = stack[stack.length-1];

  function Action(...args) {
    if (this instanceof Action) {
      return _createAction(stack.concat(new ActionEntity(entity._method)));
    }
    else {
      return entity.invoke(Action, args);
    }
  }

  // templates all share the same prototype so they can be identified above with instanceof
  RefraxTools.setPrototypeOf(Action, prototypeAction);
  Action.toString = function() {
    return 'RefraxAction(' + stack.length + ') => ' + entity._method.toString();
  };

  // Method forwarding (making subscribable)
  Action.subscribe = entity.subscribe.bind(entity);
  Action.emit = entity.emit.bind(entity);

  Object.defineProperty(Action, '_entity', {value: entity});
  Object.defineProperty(Action, '_stack', {value: stack});

  RefraxTools.extend(Action, MixinAction);
  RefraxTools.extend(Action, MixinStatus);

  mixinMutable(Action);
  mixinConfigurable(Action, from);

  return Action;
}

function createAction(method) {
  if (this instanceof createAction) {
    throw new TypeError('Cannot directly instantiate createAction');
  }

  return _createAction([new ActionEntity(method)]);
}

createAction.prototype = prototypeAction;

export default createAction;
