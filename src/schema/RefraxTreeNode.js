/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');

const validDefinitionKeys = [
  'partial',
  'fragments',
  'uri',
  'paramId'
];

function validateType(type) {
  if (RefraxConstants.classify[type] === undefined) {
    throw new TypeError(
      'RefraxTreeNode - Invalid type `' + type + '`.'
    );
  }
}

function validateDefinition(definition) {
  if (!RefraxTools.isPlainObject(definition)) {
    throw new TypeError(
      'RefraxTreeNode - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  RefraxTools.each(definition, function(value, key) {
    if (validDefinitionKeys.indexOf(key) === -1) {
      throw new TypeError(
        'RefraxTreeNode - Invalid definition option `' + key + '`.'
      );
    }
  });

  if (definition.partial && typeof(definition.partial) !== 'string') {
    throw new TypeError(
      'RefraxTreeNode - Option `partial` can only be of type String but found ' +
      'type `' + typeof(definition.partial) + '`.'
    );
  }

  if (definition.fragments) {
    var fragments = definition.fragments;
    if (!RefraxTools.isArray(fragments)) {
      throw new TypeError(
        'RefraxTreeNode - Option `fragments` can only be of type String but found type `' + typeof(fragments) + '`.'
      );
    }

    RefraxTools.each(fragments, function(value) {
      if (typeof(value) !== 'string') {
        throw new TypeError(
          'RefraxTreeNode - Option `fragments` contains a non-String value `' + typeof(value) + '`.'
        );
      }
    });
  }

  if (definition.uri && typeof(definition.uri) !== 'string') {
    throw new TypeError(
      'RefraxTreeNode - Option `uri` can only be of type String but found type `' + typeof(definition.uri) + '`.'
    );
  }

  if (definition.paramId && typeof(definition.paramId) !== 'string') {
    throw new TypeError(
      'RefraxTreeNode - Option `paramId` can only be of type String but found type `' + typeof(definition.paramId) + '`.'
    );
  }

  return definition;
}

/**
 * A RefraxTreeNode
 */
class RefraxTreeNode {
  constructor(type, definition) {
    validateType(type);
    validateDefinition(definition);

    Object.defineProperty(this, 'type', {
      value: type,
      enumerable: true
    });
    Object.defineProperty(this, 'definition', {
      value: definition,
      enumerable: true
    });
  }
}

export default RefraxTreeNode;
