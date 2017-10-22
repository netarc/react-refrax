/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { SchemaPath } from 'schema/path';
import { cleanIdentifier, extend, invariant, isPlainObject } from 'util/tools';
import { IClassification, IKeyValue } from 'util/types';
import { SchemaNode } from './node';
import { storeReference, validatePath } from './tools';

export const createSchemaResource = (path: string, options: IKeyValue = {}) => {
  let accessorNode;
  let identifier;

  invariant(typeof(path) === 'string', `createSchemaResource: expected string path identifier but found \`${path}\``);
  // tslint:disable-next-line:max-line-length
  invariant(isPlainObject(options), `createSchemaResource: expected object options identifier but found \`${options}\``);

  path = validatePath('schema/createSchemaResource', path);
  identifier = options.identifier || cleanIdentifier(path);

  accessorNode = new SchemaPath(
    new SchemaNode(IClassification.resource, identifier, extend({
      store: storeReference('schema/createSchemaCollection', identifier, options.store),
      path
    }, options.resource))
  );

  return accessorNode;
};
