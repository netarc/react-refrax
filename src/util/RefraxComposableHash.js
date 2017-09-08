/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');

/**
 * A RefraxComposableHash is a composable wrapper around an object supporting on demand hooks.
 */
class RefraxComposableHash {
  constructor(...args) {
    Object.defineProperty(this, '__hooks', {
      enumerable: false,
      writable: true,
      value: []
    });

    this.extend(...args);
  }
}

Object.defineProperty(RefraxComposableHash.prototype, 'clone', {
  enumerable: false,
  writable: false,
  value: function(...args) {
    const copy = Object.create(RefraxTools.getPrototypeOf(this));

    return copy.extend(this);
  }
});

Object.defineProperty(RefraxComposableHash.prototype, 'extend', {
  enumerable: false,
  writable: false,
  value: function(...args) {
    RefraxTools.each(args, (arg) => {
      if (RefraxTools.isPlainObject(arg)) {
        RefraxTools.extend(this, arg);
      }
      else if (RefraxTools.isFunction(arg)) {
        this.__hooks.push(arg);
      }
      else if (arg instanceof RefraxComposableHash) {
        RefraxTools.extend(this, arg);
        this.__hooks = this.__hooks.concat(arg.__hooks);
      }
      else if (arg != undefined) {
        throw new TypeError(
          'RefraxComposableHash expected argument of type `Object`\n\r' +
          'found: `' + arg + '`'
        );
      }
    });
    return this;
  }
});

Object.defineProperty(RefraxComposableHash.prototype, 'hook', {
  enumerable: false,
  writable: false,
  value: function(...fns) {
    RefraxTools.each(fns, (fn) => {
      if (!RefraxTools.isFunction(fn)) {
        throw new TypeError(
          'RefraxComposableHash expected argument of type `Object`\n\r' +
          'found: `' + fn + '`'
        );
      }

      this.__hooks.push(fn);
    });
    return this;
  }
});

Object.defineProperty(RefraxComposableHash.prototype, 'compose', {
  enumerable: false,
  writable: false,
  value: function(target) {
    const result = {};

    RefraxTools.extend(result, this);

    RefraxTools.each(this.__hooks, (hook) => {
      const params = hook.call(target, result, target) || {};

      if (!RefraxTools.isPlainObject(params)) {
        throw new TypeError(
          'RefraxComposableHash expected hook result of type `Object`\n\r' +
          'found: `' + params + '`'
        );
      }

      RefraxTools.extend(result, params);
    });

    return result;
  }
});

export default RefraxComposableHash;
