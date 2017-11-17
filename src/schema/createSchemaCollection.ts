/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { singular } from 'pluralize';

import { createSchemaPath, SchemaPath } from '../schema/path';
import { cleanIdentifier, extend, invariant, isPlainObject } from '../util/tools';
import { IClassification, IKeyValue } from '../util/types';
import { SchemaNode } from './node';
import { storeReference, validatePath } from './tools';

export const createSchemaCollection = (path: string, options: IKeyValue = {}): SchemaPath => {
  let collectionPath: SchemaPath;
  let memberIdentifier: string;
  let memberId: string;
  let identifier: string;

  invariant(typeof(path) === 'string', `createSchemaCollection: expected string path identifier but found \`${path}\``);
  // tslint:disable-next-line:max-line-length
  invariant(isPlainObject(options), `createSchemaCollection: expected object options identifier but found \`${options}\``);

  path = validatePath('schema/createSchemaCollection', path);
  identifier = options.identifier || cleanIdentifier(path);

  // Collection Node

  collectionPath = createSchemaPath(
    new SchemaNode(IClassification.collection, identifier, extend({
      store: storeReference('schema/createSchemaCollection', identifier, options.store),
      path
    }, options.collection))
  );

  // Member Node

  memberIdentifier = singular(identifier);
  if (memberIdentifier === identifier) {
    memberIdentifier = 'member';
    memberId = identifier + 'Id';
  }
  else {
    memberId = memberIdentifier + 'Id';
  }

  collectionPath.addLeaf(
    new SchemaNode(IClassification.item, memberIdentifier, extend({
      paramId: memberId
    }, options.member))
  );

  return collectionPath;
};
