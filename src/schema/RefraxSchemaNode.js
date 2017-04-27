/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxStore = require('RefraxStore');
const validDefinitionKeys = [
  'classify',
  'partial',
  'fragments',
  'uri',
  'store',
  'paramId',
  'paramMap',
  'storeMap'
];

function validateDefinition(definition) {
  if (!RefraxTools.isPlainObject(definition)) {
    throw new TypeError(
      'RefraxSchemaNode - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  RefraxTools.each(definition, function(value, key) {
    if (validDefinitionKeys.indexOf(key) === -1) {
      throw new TypeError(
        'RefraxSchemaNode - Invalid definition option `' + key + '`.'
      );
    }
  });

  if (definition.partial !== undefined && typeof(definition.partial) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `partial` can only be of type String but found ' +
      'type `' + typeof(definition.partial) + '`.'
    );
  }

  if (definition.fragments) {
    var fragments = definition.fragments;
    if (!RefraxTools.isArray(fragments)) {
      throw new TypeError(
        'RefraxSchemaNode - Option `fragments` can only be of type String but found type `' + typeof(fragments) + '`.'
      );
    }

    RefraxTools.each(fragments, function(value) {
      if (typeof(value) !== 'string') {
        throw new TypeError(
          'RefraxSchemaNode - Option `fragments` contains a non-String value `' + typeof(value) + '`.'
        );
      }
    });
  }

  if (definition.classify !== undefined && typeof(definition.classify) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `classify` can only be of type String but found type `' + typeof(definition.classify) + '`.'
    );
  }

  if (definition.uri !== undefined && typeof(definition.uri) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `uri` can only be of type String but found type `' + typeof(definition.uri) + '`.'
    );
  }

  if (definition.paramId !== undefined && typeof(definition.paramId) !== 'string') {
    throw new TypeError(
      'RefraxSchemaNode - Option `paramId` can only be of type String but found type `' + typeof(definition.paramId) + '`.'
    );
  }

  if (definition.store !== undefined && !(typeof(definition.store) === 'string' ||
                                          (definition.store instanceof RefraxStore))) {
    throw new TypeError(
      'RefraxSchemaNode - Option `store` can only be of type String/Store but found type `' + typeof(definition.store) + '`.'
    );
  }

  return definition;
}


class RefraxSchemaNode {
  constructor(type, identifier, definition = {}) {
    if (identifier && typeof(identifier) !== 'string') {
      throw new TypeError(
        'RefraxSchemaNode - A identifier argument can only be of type `String`, ' +
        'but found type `' + typeof(identifier)+ '`.'
      );
    }

    validateDefinition(definition);

    Object.defineProperty(this, 'type', {value: type});
    Object.defineProperty(this, 'identifier', {value: identifier});
    Object.defineProperty(this, 'definition', {value: definition});
    Object.defineProperty(this, 'leafs', {value: {}});
  }
}

export default RefraxSchemaNode;
