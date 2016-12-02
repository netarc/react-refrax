/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxTreeNode = require('RefraxTreeNode');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaTools = require('RefraxSchemaTools');


function createSchemaNamespace(path, options) {
  var treeNode, accessorNode, identifier;

  path = RefraxSchemaTools.validatePath('createSchemaNamespace', path);
  options = options || {};
  identifier = RefraxTools.cleanIdentifier(path);

  treeNode = new RefraxTreeNode(RefraxTools.extend({
    uri: path
  }, options.namespace));

  accessorNode = new RefraxSchemaPath(
    new RefraxSchemaNode(treeNode, identifier)
  );

  return accessorNode;
}

export default createSchemaNamespace;
