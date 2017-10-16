/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import RefraxStoreMap from 'RefraxStoreMap';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxSchemaPath from 'RefraxSchemaPath';
import RefraxAdapter from 'RefraxAdapter';
import XHRAdapter from 'XHRAdapter';
import LocalStorageAdapter from 'LocalStorageAdapter';
import SessionStorageAdapter from 'SessionStorageAdapter';
import { extend, isPlainObject } from 'RefraxTools';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_SCHEMA = RefraxConstants.classify.schema;


function validateDefinition(definition) {
  if (!isPlainObject(definition)) {
    throw new TypeError(
      'RefraxSchema - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  // Shallow copy so modifications don't affect the source
  definition = extend({}, definition);

  if ('storeMap' in definition && !(definition.storeMap instanceof RefraxStoreMap)) {
    throw new TypeError(
      'RefraxSchema - Option `storeMap` can only be of type RefraxStoreMap but found ' +
      'type `' + typeof(definition.storeMap) + '`.'
    );
  }
  else {
    definition.storeMap = new RefraxStoreMap();
  }

  if ('adapter' in definition) {
    if (typeof(definition.adapter) === 'string') {
      if (!(definition.adapter = RefraxSchema.adapters[definition.adapter])) {
        throw new ReferenceError(
          `RefraxSchema - No adapter found named \`${definition.adapter}\``
        );
      }
    }

    if (!(definition.adapter instanceof RefraxAdapter)) {
      throw new TypeError(
        'RefraxSchema - Option `adapter` can only be of type RefraxAdapter but found ' +
        'type `' + typeof(definition.adapter) + '`.'
      );
    }
  }
  else {
    definition.adapter = new XHRAdapter();
  }

  return definition;
}

class RefraxSchema extends RefraxSchemaPath {
  static adapters = {
    base: RefraxAdapter,
    xhr: XHRAdapter,
    localStorage: LocalStorageAdapter,
    sessionStorage: SessionStorageAdapter
  };

  constructor(definition = {}) {
    definition = validateDefinition(definition);

    super(new RefraxSchemaNode(CLASSIFY_SCHEMA, null, definition));
  }

  toString() {
    return 'RefraxSchema';
  }

  invalidate() {
    const storeMap = this.__node.definition.storeMap;
    storeMap.invalidate.apply(storeMap, arguments);
  }

  reset() {
    const storeMap = this.__node.definition.storeMap;
    storeMap.reset.apply(storeMap, arguments);
  }
}

export default RefraxSchema;
