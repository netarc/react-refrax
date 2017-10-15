/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { extend, cleanIdentifier } from 'RefraxTools';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxSchemaPath from 'RefraxSchemaPath';
import { validatePath } from 'RefraxSchemaTools';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;


function createSchemaNamespace(path, options) {
  var accessorNode, identifier;

  path = validatePath('createSchemaNamespace', path);
  options = options || {};
  identifier = cleanIdentifier(path);

  accessorNode = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_NAMESPACE, identifier, extend({
      path: path
    }, options.namespace))
  );

  return accessorNode;
}

export default createSchemaNamespace;
