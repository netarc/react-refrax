/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const pluralize = require('pluralize');
const RefraxStore = require('RefraxStore');
const RefraxTools = require('RefraxTools');


export function validatePath(scope, path) {
  if (!path || typeof(path) !== 'string' || path.length === 0) {
    throw new TypeError(
      scope + ' - A valid path must be passed, but found type `' + typeof(path)+ '` with value `' + path + '`.'
    );
  }

  return RefraxTools.cleanPath(path);
}

export function defaultStore(scope, identifier, store) {
  if (!store) {
    store = new RefraxStore({ type: pluralize.singular(identifier) });
  }
  else if (typeof(store) === 'string') {
    store = new RefraxStore({ type: store });
  }
  else if (!(store instanceof RefraxStore)) {
    throw new TypeError(
      scope + ' - A valid store reference of either a `String` or `Store` type must be passed, ' +
      'but found type `' + typeof(store)+ '`.'
    );
  }

  return store;
}

export function storeReference(scope, identifier, store) {
  if (!store) {
    return pluralize.singular(identifier);
  }
  else if (typeof(store) === 'string') {
    return store;
  }
  else if (!(store instanceof RefraxStore)) {
    throw new TypeError(
      scope + ' - A valid store reference of either a `String` or `Store` type must be passed, ' +
      'but found type `' + typeof(store)+ '`.'
    );
  }

  return store;
}
