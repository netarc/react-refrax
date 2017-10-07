/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxStoreMap = require('RefraxStoreMap');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxAdapter = require('RefraxAdapter');
const XHRAdapter = require('XHRAdapter');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_SCHEMA = RefraxConstants.classify.schema;


function validateDefinition(definition) {
  if (!RefraxTools.isPlainObject(definition)) {
    throw new TypeError(
      'RefraxSchema - You\'re attempting to pass an invalid definition of type `' + typeof(definition) + '`. ' +
      'A valid definition type is a regular object.'
    );
  }

  if ('storeMap' in definition && !(definition.storeMap instanceof RefraxStoreMap)) {
    throw new TypeError(
      'RefraxSchema - Option `storeMap` can only be of type RefraxStoreMap but found ' +
      'type `' + typeof(definition.storeMap) + '`.'
    );
  }

  if ('adapter' in definition && !(definition.adapter instanceof RefraxAdapter)) {
    throw new TypeError(
      'RefraxSchema - Option `adapter` can only be of type RefraxAdapter but found ' +
      'type `' + typeof(definition.adapter) + '`.'
    );
  }

  return definition;
}

class RefraxSchema extends RefraxSchemaPath {
  constructor(definition = {}) {
    validateDefinition(definition);

    definition = RefraxTools.extend({
      adapter: new XHRAdapter(),
      storeMap: new RefraxStoreMap()
    }, definition);

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
