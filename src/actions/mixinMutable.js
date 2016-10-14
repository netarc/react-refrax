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

    if (!attribute) {
      return null;
    }

    value = this.mutable[attribute];
    return value !== undefined
      ? value
      : this.getDefault && this.getDefault()[attribute];
  },
  set: function(attribute, value, options = {}) {
    this.mutable[attribute] = value;

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

    return function(value) {
      self.mutable[attribute] = value;

      if (options.noPropagate !== true) {
        self.emit('mutated', {
          type: 'attribute',
          target: attribute,
          value: value
        });
      }
    };
  },
  setterHandler: function(attribute, options = {}) {
    var self = this;

    return function(event) {
      var value = event.target.value;

      self.mutable[attribute] = value;

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
    this.mutable = {};

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
  Object.defineProperty(target, 'mutable', {
    value: {},
    writable: true
  });
  Object.defineProperty(target, 'errors', {
    value: {},
    writable: true
  });
  Object.defineProperty(target, 'default', {
    value: null,
    writable: true
  });
  Object.defineProperty(target, 'data', {
    get: function() {
      var base = this.getDefault && this.getDefault() ||
                 this.default ||
                 {};
      return RefraxTools.setPrototypeOf(this.mutable, base);
    }
  });

  return RefraxTools.extend(target, MixinMutable);
}

export default mixinMutable;
