/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const mixinSubscribable = require('mixinSubscribable');
const RefraxFragmentCache = require('RefraxFragmentCache');
const RefraxTools = require('RefraxTools');
var RefraxResourceDescriptor = null;


// circular dependency hack
function getResourceDescriptor() {
  return RefraxResourceDescriptor ||
    (RefraxResourceDescriptor = require('RefraxResourceDescriptor'));
}

function validateDefinition(definition = {}) {
  if (typeof(definition) === 'string') {
    definition = {
      type: definition
    };
  }

  if (!RefraxTools.isPlainObject(definition)) {
    throw new TypeError(
      'RefraxStore - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  if (!definition.type || typeof(definition.type) !== 'string') {
    throw new TypeError(
      'RefraxStore - `type` can only be of type String but found type ' + typeof(definition.type) + '`.'
    );
  }

  return definition;
}

/**
 * A RefraxStore is a wrapper around the RefraxFragmentCache object that offers
 * a Subscribable interface to resource mutations.
 */
class RefraxStore {
  constructor(definition) {
    if (!definition) {
      // We accept no definitions and just use an anonymous type name
      definition = {
        type: RefraxTools.randomString(12)
      };
    }
    definition = validateDefinition(definition);

    mixinSubscribable(this);

    Object.defineProperty(this, 'definition', {
      value: definition,
      enumerable: true
    });

    Object.defineProperty(this, 'cache', {
      value: null,
      writable: true
    });

    this.reset();
  }

  toString() {
    return 'RefraxStore(`' + this.definition.type + '`)';
  }

  reset() {
    this.cache = new RefraxFragmentCache();
  }

  invalidate(resourceDescriptor, options) {
    if (!(resourceDescriptor instanceof getResourceDescriptor())) {
      if (!options && RefraxTools.isPlainObject(resourceDescriptor)) {
        options = resourceDescriptor;
      }
      else if (resourceDescriptor) {
        throw new TypeError(
          'RefraxStore:invalidate - Argument `resourceDescriptor` has invalid value `' + resourceDescriptor + '`.\n' +
          'Expected type `ResourceDescriptor`, found `' + typeof(resourceDescriptor) + '`.'
        );
      }

      resourceDescriptor = null;
    }

    options = options || {};
    if (!RefraxTools.isPlainObject(options)) {
      throw new TypeError(
        'RefraxStore:invalidate - Argument `options` has invalid value `' + options + '`.\n' +
        'Expected type `Object`, found `' + typeof(options) + '`.'
      );
    }

    const touched = this.cache.invalidate(resourceDescriptor, options);
    this._notifyChange('invalidate', touched, options);
  }

  // Fragment Map is intentionally separate to allow future switching depending
  // on the need; this concept may change.

  fetchResource(resourceDescriptor) {
    return this.cache.fetch(resourceDescriptor);
  }

  touchResource(resourceDescriptor, data, options = {}) {
    const touched = this.cache.touch(resourceDescriptor, data);
    this._notifyChange('touch', touched, options);
  }

  updateResource(resourceDescriptor, data, status, options = {}) {
    const touched = this.cache.update(resourceDescriptor, data, status);
    this._notifyChange('update', touched, options);
  }

  destroyResource(resourceDescriptor, options = {}) {
    const touched = this.cache.destroy(resourceDescriptor);
    this._notifyChange('destroy', touched, options);
  }

  //

  _notifyChange(action, touched, options) {
    var i, len;

    if (options.noNotify === true) {
      return;
    }

    const event = RefraxTools.extend({}, options, {
      type: this.definition.type,
      action: action
    });

    // fragments
    for (i = 0, len = touched.fragments.length; i < len; i++) {
      const id = touched.fragments[i];
      this.emit(id, RefraxTools.extend({}, event, { fragment: id }));
    }
    // queries
    for (i = 0, len = touched.queries.length; i < len; i++) {
      const id = touched.queries[i];
      this.emit(id, RefraxTools.extend({}, event, { query: id }));
    }
  }
}

export default RefraxStore;
