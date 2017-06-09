/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');

const setState = (state, attribute, value, options, emit) => {
  const attributes = options.shallow === true ? [attribute] : attribute.split('.');

  for (let attr_count = attributes.length, i = 0; i < attr_count; i++) {
    const attr = attributes[i];

    // If we are the last attribute then just set the value
    if (i + 1 >= attr_count) {
      state[attr] = value;
    }
    else {
      if (state[attr] === undefined) {
        state[attr] = {};
      }

      state = state[attr];
      if (!RefraxTools.isPlainObject(state)) {
        throw new TypeError(`mixinMutable - set expected deep attribute \`${attributes.slice(0, i + 1).join('.')}\` to be an object but found \`${state}\``);
      }
    }
  }

  if (emit) {
    emit.call(this, 'mutated', {
      type: 'attribute',
      target: attribute,
      value: value
    });
  }
};

const getState = (state, attribute, options) => {
  const attributes = options.shallow === true ? [attribute] : attribute.split('.');

  for (let attr_count = attributes.length, i = 0; i < attr_count; i++) {
    const attr = attributes[i];

    // If we are the last attribute then just set the value
    if (i + 1 >= attr_count) {
      return state[attr];
    }
    else {
      state = state[attr];

      if (!RefraxTools.isPlainObject(state)) {
        break;
      }
    }
  }

  return undefined;
};

const MixinMutable = {
  get: function(attribute, options = {}) {
    var value;

    if (typeof(attribute) !== 'string') {
      throw new TypeError('mixinMutable - get expected attribute name but found `' + attribute + '`');
    }

    value = getState(this._mutable._state, attribute, options);
    return value !== undefined
      ? value
      : this.getDefault && getState(this.getDefault(), attribute, options);
  },
  set: function(attribute, ...args) {
    const state = this._mutable._state;

    if (attribute && typeof(attribute) === 'object') {
      const options = args.shift() || {};
      const emit = options.noPropagate !== true && this.emit;

      for (const k in attribute) {
        const v = attribute[k];

        state[k] = v;
        if (emit) {
          emit.call(this, 'mutated', {
            type: 'attribute',
            target: k,
            value: v
          });
        }
      }
    }
    else {
      let value = args.shift();
      const options = args.shift() || {};
      const emit = options.noPropagate !== true && this.emit;
      const onSet = options.onSet;
      const set = options.set;

      if (typeof(attribute) !== 'string') {
        throw new TypeError('mixinMutable - set expected attribute name but found `' + attribute + '`');
      }

      // Does our value look like an Event
      const target = value && typeof(value) === 'object' && (value.target || value.srcElement);
      if (target && 'value' in target) {
        value = target.value;
      }

      setState.call(this, state, attribute, value, options, emit);

      if (onSet) {
        onSet(value, attribute);
      }

      if (set && typeof(set) === 'object') {
        for (const k in set) {
          let v = set[k];

          if (typeof(v) === 'function') {
            v = v(value);
          }

          setState.call(this, state, k, v, options, emit);
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
    const emit = options.noPropagate !== true && this.emit;

    // mixinMutable can be used on a prototype chain so set on mutable
    this._mutable._state = {};

    if (emit) {
      emit.call(this, 'mutated', {
        type: 'attribute',
        target: null,
        value: null
      });
    }
  },
  isMutated: function() {
    const state = this._mutable._state;

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
      var state = RefraxTools.extend({}, target._state)
        , defaultState = this.getDefault && this.getDefault() || {};

      return RefraxTools.setPrototypeOf(state, defaultState);
    }
  });

  return RefraxTools.extend(target, MixinMutable);
}

export default mixinMutable;
