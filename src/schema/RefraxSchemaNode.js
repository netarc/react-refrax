/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { extend, each, isPlainObject, isArray } from 'RefraxTools';
import RefraxStore from 'RefraxStore';
import RefraxConstants from 'RefraxConstants';
import RefraxStoreMap from 'RefraxStoreMap';

const CLASSIFY_SCHEMA = RefraxConstants.classify.schema;
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const validDefinitionKeys = {};


validDefinitionKeys[CLASSIFY_SCHEMA] = [
  'storeMap',
  'adapter'
];

validDefinitionKeys[CLASSIFY_NAMESPACE] = [
  'path'
];

validDefinitionKeys[CLASSIFY_RESOURCE] = [
  'partial',
  'fragments',
  'path',
  'store'
];

validDefinitionKeys[CLASSIFY_COLLECTION] = [
  'partial',
  'fragments',
  'path',
  'store',
  'paramId',
  'paramMap'
];

validDefinitionKeys[CLASSIFY_ITEM] = [
  'partial',
  'fragments',
  'path',
  'store',
  'paramId',
  'paramMap'
];

function validateDefinition(type, definition) {
  const definitionKeys = validDefinitionKeys[type];
  if (!definitionKeys) {
    throw new TypeError(
      'RefraxSchemaNode - Invalid type `' + type + '`.'
    );
  }

  if (!isPlainObject(definition)) {
    throw new TypeError(
      'RefraxSchemaNode - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  each(definition, function(value, key) {
    if (definitionKeys.indexOf(key) === -1) {
      throw new TypeError(
        'RefraxSchemaNode - Invalid definition option `' + key + '`.'
      );
    }
  });

  if ('storeMap' in definition && !(definition.storeMap instanceof RefraxStoreMap)) {
    throw new TypeError(
      'RefraxSchemaNode - Option `storeMap` can only be of type RefraxStoreMap but found ' +
      'type `' + typeof(definition.storeMap) + '`.'
    );
  }

  if ('partial' in definition && typeof(definition.partial) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `partial` can only be of type String but found ' +
      'type `' + typeof(definition.partial) + '`.'
    );
  }

  if ('fragments' in definition) {
    var fragments = definition.fragments;
    if (!isArray(fragments)) {
      throw new TypeError(
        'RefraxSchemaNode - Option `fragments` can only be of type Array but found type `' + typeof(fragments) + '`.'
      );
    }

    each(fragments, function(value) {
      if (typeof(value) !== 'string') {
        throw new TypeError(
          'RefraxSchemaNode - Option `fragments` contains a non-String value `' + typeof(value) + '`.'
        );
      }
    });
  }

  if ('path' in definition && typeof(definition.path) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `path` can only be of type String but found type `' + typeof(definition.path) + '`.'
    );
  }

  if ('paramId' in definition && typeof(definition.paramId) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `paramId` can only be of type String but found type `' + typeof(definition.paramId) + '`.'
    );
  }

  if ('paramMap' in definition && !isPlainObject(definition.paramMap)) {
    throw new TypeError(
      'RefraxSchemaNode - Option `paramMap` can only be of type Object but found type `' + typeof(definition.paramMap) + '`.'
    );
  }

  if ('store' in definition && !(typeof(definition.store) === 'string' ||
                                (definition.store instanceof RefraxStore))) {
    throw new TypeError(
      'RefraxSchemaNode - Option `store` can only be of type String/Store but found type `' + typeof(definition.store) + '`.'
    );
  }

  return definition;
}


class RefraxSchemaNode {
  constructor(type = CLASSIFY_NAMESPACE, identifier = null, definition = null) {
    if (isPlainObject(identifier) && !definition) {
      definition = identifier;
      identifier = null;
    }

    if (!definition) {
      definition = {};
    }
    else {
      // shallow copy since we mutate below
      definition = extend({}, definition);
    }

    if (identifier && typeof(identifier) !== 'string') {
      throw new TypeError(
        'RefraxSchemaNode - A identifier argument can only be of type `String`, ' +
        'but found type `' + typeof(identifier)+ '`.'
      );
    }

    validateDefinition(type, definition);

    // TODO: Do we need to classify this anymore?
    definition.classify = type;

    Object.defineProperty(this, 'type', { value: type });
    Object.defineProperty(this, 'identifier', { value: identifier });
    Object.defineProperty(this, 'definition', { value: definition });
    Object.defineProperty(this, 'leafs', { value: {} });
  }
}

export default RefraxSchemaNode;
