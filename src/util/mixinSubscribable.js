/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import EventEmitter from 'eventemitter3';
import { extend } from 'RefraxTools';
import RefraxDisposable from 'RefraxDisposable';


const Mixin = {
  subscribe: function(event, callback, context) {
    var disposable = false
      , eventHandler = null;

    context = context || this;

    if (typeof(event) !== 'string') {
      throw new TypeError('mixinSubscribable - subscribe expected string event but found type `' + event + '`');
    }

    if (typeof(callback) !== 'function') {
      throw new TypeError('mixinSubscribable - subscribe expected callback but found `' + event + '`');
    }

    disposable = new RefraxDisposable(() => {
      this._emitter.removeListener(event, eventHandler);
    });

    eventHandler = function() {
      if (disposable.disposed) {
        return;
      }
      callback.apply(context, arguments);
    };

    this._emitter.addListener(event, eventHandler);

    return disposable;
  },

  once: function(event, callback, context) {
    var disposable = false
      , eventHandler = null;

    context = context || this;

    if (typeof(event) !== 'string') {
      throw new TypeError('mixinSubscribable - subscribe expected string event but found type `' + event + '`');
    }

    if (typeof(callback) !== 'function') {
      throw new TypeError('mixinSubscribable - subscribe expected callback but found `' + event + '`');
    }

    disposable = new RefraxDisposable(() => {
      this._emitter.removeListener(event, eventHandler);
    });

    eventHandler = function() {
      if (disposable.disposed) {
        return;
      }
      callback.apply(context, arguments);
      disposable();
    };

    this._emitter.addListener(event, eventHandler);

    return disposable;
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

  return extend(target, Mixin);
}

export default mixinSubscribable;
