/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaTools = require('RefraxSchemaTools');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;


function createSchemaNamespace(path, options) {
  var accessorNode, identifier;

  path = RefraxSchemaTools.validatePath('createSchemaNamespace', path);
  options = options || {};
  identifier = RefraxTools.cleanIdentifier(path);

  accessorNode = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_NAMESPACE, identifier, RefraxTools.extend({
      classify: CLASSIFY_NAMESPACE,
      uri: path
    }, options.namespace))
  );

  return accessorNode;
}

export default createSchemaNamespace;
