/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const EventEmitter = require('eventemitter3');


const Mixin = {
  subscribe: function(event, callback, context) {
    var disposed = false
      , self = this
      , eventHandler = null;

    if (typeof(event) !== 'string') {
      throw new TypeError('mixinSubscribable - subscribe expected string event but found type `' + event + '`');
    }

    if (typeof(callback) !== 'function') {
      throw new TypeError('mixinSubscribable - subscribe expected callback but found `' + event + '`');
    }

    context = context || this;
    eventHandler = function() {
      if (disposed) {
        return;
      }
      callback.apply(context, arguments);
    };

    this._emitter.addListener(event, eventHandler);

    return function() {
      if (!disposed) {
        disposed = true;
        self._emitter.removeListener(event, eventHandler);
      }
    };
  },

  once: function(event, callback, context) {
    var disposed = false
      , eventHandler = null;

    if (typeof(event) !== 'string') {
      throw new TypeError('mixinSubscribable - subscribe expected string event but found type `' + event + '`');
    }

    if (typeof(callback) !== 'function') {
      throw new TypeError('mixinSubscribable - subscribe expected callback but found `' + event + '`');
    }

    context = context || this;
    eventHandler = function() {
      if (disposed) {
        return;
      }
      disposed = true;
      callback.apply(context, arguments);
    };

    this._emitter.once(event, eventHandler, context || this);
    return () => {
      if (!disposed) {
        disposed = true;
        this._emitter.removeListener(event, eventHandler);
      }
    };
  },

  emit: function() {
    return this._emitter.emit.apply(this._emitter, arguments);
  }
};

function mixinSubscribable(target) {
  if (!target) {
    throw new TypeError('mixinSubscribable - exepected non-null target');
  }

  Object.defineProperty(target, '_emitter', {
    value: new EventEmitter()
  });

  return RefraxTools.extend(target, Mixin);
}

mixinSubscribable.asDisposable = function(target) {
  mixinSubscribable(target);

  return () => {
    target._emitter.removeAllListeners();
  };
};

export default mixinSubscribable;
