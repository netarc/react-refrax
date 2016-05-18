/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');

const SchemaAccescessorMixins = [];

// Determine if a stack matches the ending of another
function compareStack(part, stack) {
  stack = stack.slice(Math.max(stack.length - part.length, 1));
  return JSON.stringify(part) === JSON.stringify(stack);
}

function enumerateLeafs(node, stack, action) {
  RefraxTools.each(node.leafs, function(leaf, key) {
    if (!leaf.stack || compareStack(leaf.stack, stack)) {
      action(key, leaf.node, stack.concat(leaf.node.subject));
    }
  });
}

function createLeaf(accessor, detached, identifier, leafNode) {
  var node = accessor.__node
    , stack = accessor.__stack;

  if (!leafNode) {
    leafNode = identifier;
    identifier = null;
  }

  if (leafNode instanceof RefraxSchemaNodeAccessor) {
    leafNode = leafNode.__node;
  }
  else if (!(leafNode instanceof RefraxSchemaNode)) {
    throw new TypeError(
      'RefraxSchemaNodeAccessor:addLeaf - Expected leaf of type RefraxSchemaNodeAccessor or RefraxSchemaNode'
    );
  }

  if (!identifier && !(identifier = leafNode.identifier)) {
    throw new TypeError(
      'RefraxSchemaNodeAccessor:addLeaf - Failed to add leaf with no inherit identifier.'
    );
  }

  identifier = RefraxTools.cleanIdentifier(identifier);
  node.leafs[identifier] = {node: leafNode, stack: detached ? stack : null};

  Object.defineProperty(accessor, identifier, {
    get: function() {
      return new RefraxSchemaNodeAccessor(leafNode, node, stack.concat(leafNode.subject));
    }
  });
}

class RefraxSchemaNodeAccessor {
  constructor(node, parent, stack) {
    var self = this;

    if (!(node instanceof RefraxSchemaNode)) {
      throw new TypeError(
        'RefraxSchemaNodeAccessor - Expected node of type RefraxSchemaNode but found `' + typeof(node) + '`'
      );
    }

    if (!stack) {
      stack = [].concat(node.subject);
    }

    Object.defineProperty(this, '__node', {value: node});
    Object.defineProperty(this, '__parent', {value: parent});
    Object.defineProperty(this, '__stack', {value: stack});

    RefraxTools.each(SchemaAccescessorMixins, function(mixin) {
      RefraxTools.extend(this, mixin);
    });

    enumerateLeafs(node, stack, function(key, leafNode, leafStack) {
      Object.defineProperty(self, key, {
        get: function() {
          return new RefraxSchemaNodeAccessor(leafNode, node, leafStack);
        }
      });
    });
  }

  inspect(result = {}) {
    var node = this.__node
      , stack = this.__stack;

    enumerateLeafs(node, stack, function(key, leafNode, leafStack) {
      var descriptor = new RefraxResourceDescriptor(leafStack, false);
      result[descriptor.path] = descriptor;
      new RefraxSchemaNodeAccessor(leafNode, node, leafStack).inspect(result);
    });

    return result;
  }

  addLeaf(identifier, leaf) {
    createLeaf(this, false, identifier, leaf);
    return this;
  }

  addDetachedLeaf(identifier, leaf) {
    createLeaf(this, true, identifier, leaf);
    return this;
  }
}

RefraxSchemaNodeAccessor.mixins = SchemaAccescessorMixins;

export default RefraxSchemaNodeAccessor;
