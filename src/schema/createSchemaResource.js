/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { extend, cleanIdentifier, isPlainObject } from 'RefraxTools';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxSchemaPath from 'RefraxSchemaPath';
import { validatePath, storeReference } from 'RefraxSchemaTools';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;


function createSchemaResource(path, store, options) {
  var accessorNode, identifier;

  if (isPlainObject(store)) {
    options = store;
    store = null;
  }

  path = validatePath('createSchemaResource', path);
  options = options || {};
  identifier = options.identifier || cleanIdentifier(path);

  accessorNode = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_RESOURCE, identifier, extend({
      store: storeReference('createSchemaCollection', identifier, store),
      path: path
    }, options.resource))
  );

  return accessorNode;
}

export default createSchemaResource;
