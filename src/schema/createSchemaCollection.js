/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const pluralize = require('pluralize');
const RefraxTools = require('RefraxTools');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaTools = require('RefraxSchemaTools');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;


function createSchemaCollection(path, store, options) {
  var collectionPath
    , memberIdentifier, memberId
    , identifier;

  if (RefraxTools.isPlainObject(store) && !options) {
    options = store;
    store = null;
  }

  path = RefraxSchemaTools.validatePath('createSchemaCollection', path);
  options = options || {};
  identifier = options.identifier || RefraxTools.cleanIdentifier(path);

  // Collection Node

  collectionPath = new RefraxSchemaPath(
    new RefraxSchemaNode(CLASSIFY_COLLECTION, identifier, RefraxTools.extend({
      store: RefraxSchemaTools.storeReference('createSchemaCollection', identifier, store),
      classify: CLASSIFY_COLLECTION,
      uri: path
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
    new RefraxSchemaNode(CLASSIFY_ITEM, memberIdentifier, RefraxTools.extend({
      classify: CLASSIFY_ITEM,
      paramId: memberId
    }, options.member))
  );

  return collectionPath;
}

export default createSchemaCollection;
