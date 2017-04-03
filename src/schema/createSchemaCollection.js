/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const pluralize = require('pluralize');
const RefraxTools = require('RefraxTools');
const RefraxTreeNode = require('RefraxTreeNode');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaTools = require('RefraxSchemaTools');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;


function createSchemaCollection(path, store, options) {
  var treeNodeCollection, accessorNodeCollection
    , treeNodeMember
    , memberIdentifier, memberId
    , identifier;

  if (RefraxTools.isPlainObject(store) && !options) {
    options = store;
    store = null;
  }

  path = RefraxSchemaTools.validatePath('createSchemaCollection', path);
  options = options || {};
  identifier = options.identifier || RefraxTools.cleanIdentifier(path);
  store = RefraxSchemaTools.defaultStore('createSchemaCollection', identifier, store);

  // Collection Node

  treeNodeCollection = new RefraxTreeNode(CLASSIFY_COLLECTION, RefraxTools.extend({
    uri: path
  }, options.collection));

  accessorNodeCollection = new RefraxSchemaPath(
    new RefraxSchemaNode([store, treeNodeCollection], identifier)
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

  treeNodeMember = new RefraxTreeNode(CLASSIFY_ITEM, RefraxTools.extend({
    paramId: memberId
  }, options.member));

  accessorNodeCollection.addLeaf(
    new RefraxSchemaNode(treeNodeMember, memberIdentifier)
  );

  return accessorNodeCollection;
}

export default createSchemaCollection;
