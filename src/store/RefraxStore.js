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

    this.cache.invalidate(resourceDescriptor, options);
    this._notifyChange(resourceDescriptor, RefraxTools.extend({action: 'invalidate'}, options));
  }

  // Fragment Map is intentionally separate to allow future switching depending
  // on the need; this concept may change.

  fetchResource(resourceDescriptor) {
    return this.cache.fetch(resourceDescriptor);
  }

  touchResource(resourceDescriptor, data, options = {}) {
    this.cache.touch(resourceDescriptor, data);
    this._notifyChange(resourceDescriptor, RefraxTools.extend({action: 'touch'}, options));
  }

  updateResource(resourceDescriptor, data, status, options = {}) {
    this.cache.update(resourceDescriptor, data, status);
    this._notifyChange(resourceDescriptor, RefraxTools.extend({action: 'update'}, options));
  }

  destroyResource(resourceDescriptor, options = {}) {
    this.cache.destroy(resourceDescriptor);
    this._notifyChange(resourceDescriptor, RefraxTools.extend({action: 'destroy'}, options));
  }

  //

  _notifyChange(resourceDescriptor, event) {
    if (event.noNotify === true) {
      return;
    }

    event = RefraxTools.extend({type: this.definition.type}, event);

    this.emit('change', event);
    if (resourceDescriptor && resourceDescriptor.id) {
      this.emit(
        'change:' + resourceDescriptor.id,
        RefraxTools.extend({id: resourceDescriptor.id}, event)
      );
    }
  }
}

export default RefraxStore;
