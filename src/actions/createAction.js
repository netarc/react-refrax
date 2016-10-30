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
const mixinStatus = require('mixinStatus');
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxOptions = require('RefraxOptions');
const RefraxResource = require('RefraxResource');
const RefraxTools = require('RefraxTools');
const prototypeAction = {};


class ActionInvoker {
  constructor(action, options) {
    Object.defineProperty(this, '_action', {value: action});
    Object.defineProperty(this, '_options', {value: options});
  }

  mutableFrom(accessor, ...args) {
    return RefraxMutableResource.from(accessor, new RefraxOptions(this._options.resource), ...args);
  }

  invalidate(items, options) {
    options = RefraxTools.extend({}, this._options.resource, options);
    items = [].concat(items || []);

    RefraxTools.each(items, (item) => item.invalidate(options));
  }
}

function invokeAction(emitters, method, data, options, args) {
  var action = emitters[0]
    , invoker = new ActionInvoker(action, options)
    , promise, result, i;

  // reset errors on invocation
  action.errors = {};
  data = RefraxTools.extend(
    {},
    options.includeDefault === true ? action.getDefault() : null,
    action.mutable,
    data
  );

  for (i=0; i<emitters.length; i++) {
    emitters[i].emit('start');
  }

  promise = result = method.apply(invoker, [data].concat(args));

  if (!RefraxTools.isPromise(result)) {
    promise = new Promise(function(resolve, reject) {
      resolve(result);
    });
  }

  promise.catch(function(err) {
    if (RefraxTools.isPlainObject(err.response.data)) {
      action.errors = RefraxTools.extend({}, err.response.data);
      action.emit('mutated', {
        type: 'errors'
      });
    }
  });

  action._promises.push(promise);
  function finalize() {
    var i = action._promises.indexOf(promise);
    if (i > -1) {
      action._promises.splice(i, 1);
    }

    for (i=0; i<emitters.length; i++) {
      emitters[i].emit('finish');
    }
  }
  promise.then(finalize, finalize);

  return promise;
}

function createActionInstance(Action, method, options) {
  function ActionInstance(data, ...args) {
    return invokeAction([ActionInstance, Action], method, data, options, args);
  }

  ActionInstance.getDefault = function() {
    var result = ActionInstance.default || {};

    if (RefraxTools.isFunction(result)) {
      result = result();
    }

    if (result instanceof RefraxResource) {
      result = result.data || {};
    }
    else if (!RefraxTools.isPlainObject(result)) {
      throw new TypeError('ActionInstance ' + Action + ' failed to resolve default value');
    }

    return result;
  };

  mixinSubscribable(ActionInstance);
  mixinStatus(ActionInstance);
  mixinMutable(ActionInstance);

  ActionInstance.default = options.default;

  return ActionInstance;
}

function createAction(method) {
  if (this instanceof createAction) {
    throw new TypeError('Cannot call createAction as a class');
  }

  /**
   * An Action can either be globally invoked or instantiated and invoked on that
   * particular instance.
   */
  function Action(arg1, ...args) {
    if (this instanceof Action) {
      return createActionInstance(Action, method, arg1);
    }
    else {
      return invokeAction([Action], method, arg1, {}, args);
    }
  }
  // templates all share the same prototype so they can be identified above with instanceof
  RefraxTools.setPrototypeOf(Action, prototypeAction);

  mixinSubscribable(Action);
  mixinStatus(Action);
  mixinMutable(Action);

  return Action;
}

createAction.prototype = prototypeAction;

export default createAction;
