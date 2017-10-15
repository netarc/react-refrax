/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import pluralize from 'pluralize';
import { extend, cleanIdentifier, isPlainObject } from 'RefraxTools';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxSchemaPath from 'RefraxSchemaPath';
import { validatePath, storeReference } from 'RefraxSchemaTools';
import RefraxConstants from 'RefraxConstants';

const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;


function createSchemaCollection(path, store, options) {
  var collectionPath
    , memberIdentifier, memberId
    , identifier;

  if (isPlainObject(store) && !options) {
    options = store;
    store = null;
  }

  path = validatePath('createSchemaCollection', path);
  options = options || {};
  identifier = options.identifier || cleanIdentifier(path);

  // Collection Node

  collectionPath = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_COLLECTION, identifier, extend({
      store: storeReference('createSchemaCollection', identifier, store),
      path: path
    }, options.collection))
  );

  // Member Node

  memberIdentifier = pluralize.singular(identifier);
  if (memberIdentifier === identifier) {
    memberIdentifier = 'member';
    memberId = identifier + 'Id';
  }
  else {
    memberId = memberIdentifier + 'Id';
  }

  collectionPath.addLeaf(
    new RefraxSchemaNode(CLASSIFY_ITEM, memberIdentifier, extend({
      paramId: memberId
    }, options.member))
  );

  return collectionPath;
}

export default createSchemaCollection;
