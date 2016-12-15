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
  set: function(attribute, ...args) {
    const state = this._state;

    if (attribute && typeof(attribute) === 'object') {
      const options = args.shift() || {};
      const emit = options.noPropagate !== true && this.emit && this.emit.bind(this);

      for (const k in attribute) {
        const v = attribute[k];

        state[k] = v;
        if (emit) {
          emit('mutated', {
            type: 'attribute',
            target: k,
            value: v
          });
        }
      }
    }
    else {
      var value = args.shift() || null;
      const options = args.shift() || {};
      const canEmit = options.noPropagate !== true && this.emit;
      const onSet = options.onSet;
      const set = options.set;

      if (typeof(attribute) !== 'string') {
        throw new TypeError('mixinMutable - set expected attribute name but found `' + attribute + '`');
      }

      // Does our value look like an Event
      if (value && typeof(value) === 'object' && value.target && value.target.value) {
        value = value.target.value;
      }

      state[attribute] = value;
      if (canEmit) {
        this.emit('mutated', {
          type: 'attribute',
          target: attribute,
          value: value
        });
      }

      if (onSet) {
        onSet(value, attribute);
      }

      if (set && typeof(set) === 'object') {
        for (const k in set) {
          let v = set[k];

          if (typeof(v) === 'function') {
            v = v(value);
          }

          state[k] = v;
          if (canEmit) {
            this.emit('mutated', {
              type: 'attribute',
              target: k,
              value: v
            });
          }
        }
      }
    }
  },
  setter: function(attribute, options = {}) {
    if (typeof(attribute) !== 'string') {
      throw new TypeError('mixinMutable - setter expected attribute name but found `' + attribute + '`');
    }

    if (typeof(options) === 'function') {
      options = {
        onSet: options
      };
    }

    return (value) => {
      this.set(attribute, value, options);
    };
  },
  unset: function(options = {}) {
    const canEmit = options.noPropagate !== true && this.emit;

    // mixinMutable can be used on a prototype chain so set on mutable
    this._mutable._state = {};

    if (canEmit) {
      this.emit('mutated', {
        type: 'attribute',
        target: null,
        value: null
      });
    }
  },
  isMutated: function() {
    const state = this._state;

    for (const k in state) {
      if (state[k] !== undefined) {
        return true;
      }
    }
    return false;
  },
  unsetErrors: function(options = {}) {
    this.setErrors(null, options);
  },
  setErrors: function(errors, options = {}) {
    const canEmit = options.noPropagate !== true && this.emit;

    if (errors && !RefraxTools.isPlainObject(errors)) {
      throw new TypeError('mixinMutable - setErrors expected errors object');
    }

    // mixinMutable can be used on a prototype chain so set on mutable
    this._mutable.errors = errors || {};

    if (canEmit) {
      this.emit('mutated', {
        type: 'errors',
        errors: errors
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

  Object.defineProperty(target, '_mutable', {
    value: target,
    writable: false
  });
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
