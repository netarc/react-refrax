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
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;


function createSchemaResource(path, store, options) {
  var accessorNode, identifier;

  if (RefraxTools.isPlainObject(store)) {
    options = store;
    store = null;
  }

  path = RefraxSchemaTools.validatePath('createSchemaResource', path);
  options = options || {};
  identifier = options.identifier || RefraxTools.cleanIdentifier(path);

  accessorNode = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_RESOURCE, identifier, RefraxTools.extend({
      store: RefraxSchemaTools.storeReference('createSchemaCollection', identifier, store),
      path: path
    }, options.resource))
  );

  return accessorNode;
}

export default createSchemaResource;
