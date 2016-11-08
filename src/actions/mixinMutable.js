/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');


const MixinMutable = {
  get: function(attribute) {
    var value;

    if (typeof(attribute) !== 'string') {
      throw new TypeError('mixinMutable - get expected attribute name but found `' + attribute + '`');
    }

    value = this._state[attribute];
    return value !== undefined
      ? value
      : this.getDefault && this.getDefault()[attribute];
  },
  set: function(attribute, value, options = {}) {
    if (typeof(attribute) !== 'string') {
      throw new TypeError('mixinMutable - set expected attribute name but found `' + attribute + '`');
    }

    this._state[attribute] = value;

    if (options.noPropagate !== true) {
      this.emit('mutated', {
        type: 'attribute',
        target: attribute,
        value: value
      });
    }
  },
  setter: function(attribute, options = {}) {
    var self = this;

    if (typeof(attribute) !== 'string') {
      throw new TypeError('mixinMutable - setter expected attribute name but found `' + attribute + '`');
    }

    return function(value) {
      if (typeof(value) === 'object' && value.target && value.target.value) {
        value = value.target.value;
      }

      self._state[attribute] = value;

      if (options.noPropagate !== true) {
        self.emit('mutated', {
          type: 'attribute',
          target: attribute,
          value: value
        });
      }
    };
  },
  unset: function(options = {}) {
    this._state = {};

    if (options.noPropagate !== true) {
      this.emit('mutated', {
        type: 'attribute',
        target: null,
        value: null
      });
    }
  },
  getErrors: function(attribute) {
    return attribute ? this.errors[attribute] : this.errors;
  }
};

function mixinMutable(target) {
  if (!target) {
    throw new TypeError('mixinMutable - exepected non-null target');
  }

  Object.defineProperty(target, '_state', {
    value: {},
    writable: true
  });
  Object.defineProperty(target, 'errors', {
    value: {},
    writable: true
  });
  Object.defineProperty(target, 'data', {
    get: function() {
      var base = this.getDefault && this.getDefault() ||
                 {};
      return RefraxTools.setPrototypeOf(this._state, base);
    }
  });

  return RefraxTools.extend(target, MixinMutable);
}

export default mixinMutable;
