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
const RefraxStore = require('RefraxStore');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchemaNodeAccessor = require('RefraxSchemaNodeAccessor');


function createCollection(literal, store, options) {
  var treeNodeCollection, schemaNodeCollection, accessorNodeCollection
    , treeNodeMember, schemaNodeMember
    , memberLiteral, memberId;

  options = options || {};

  if (!literal || typeof(literal) !== 'string' || literal.length === 0) {
    throw new TypeError(
      'createCollection - A valid literal must be passed, but found type `' + typeof(literal)+ '` with value `' + literal + '`.'
    );
  }

  if (!store || !(typeof(store) === 'string' || store instanceof RefraxStore)) {
    throw new TypeError(
      'createCollection - A valid store reference of either a `String` or `Store` type must be passed, ' +
      'but found type `' + typeof(store)+ '`.'
    );
  }

  if (typeof(store) === 'string') {
    store = RefraxStore.get(store);
  }

  // Collection Node

  treeNodeCollection = new RefraxTreeNode(RefraxTools.extend({
    uri: literal,
    coerce: 'collection'
  }, options.collection));

  schemaNodeCollection = new RefraxSchemaNode([store, treeNodeCollection], literal);
  accessorNodeCollection = new RefraxSchemaNodeAccessor(schemaNodeCollection);

  // Member Node

  memberLiteral = pluralize.singular(literal);
  if (memberLiteral == literal) {
    memberLiteral = 'member';
    memberId = literal + 'Id';
  }
  else {
    memberId = memberLiteral + 'Id';
  }

  treeNodeMember = new RefraxTreeNode(RefraxTools.extend({
    paramId: memberId
  }, options.member));

  schemaNodeMember = new RefraxSchemaNode(treeNodeMember, memberLiteral);
  accessorNodeCollection.addLeaf(schemaNodeMember);

  return accessorNodeCollection;
}

export default createCollection;