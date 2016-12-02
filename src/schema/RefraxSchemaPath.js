/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxOptions = require('RefraxOptions');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxConstants = require('RefraxConstants');
const ACTION_INSPECT = RefraxConstants.action.inspect;
const SchemaAccescessorMixins = [];
var RefraxResource = null;


// Determine if a stack matches the ending of another
function compareStack(part, stack) {
  stack = stack.slice(Math.max(stack.length - part.length, 0));
  return JSON.stringify(part) === JSON.stringify(stack);
}

function enumerateNodeLeafs(node, stack, action) {
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

  if (leafNode instanceof RefraxSchemaPath) {
    leafNode = leafNode.__node;
  }
  else if (!(leafNode instanceof RefraxSchemaNode)) {
    throw new TypeError(
      'RefraxSchemaPath:addLeaf - Expected leaf of type RefraxSchemaPath or RefraxSchemaNode'
    );
  }

  if (!identifier && !(identifier = leafNode.identifier)) {
    throw new TypeError(
      'RefraxSchemaPath:addLeaf - Failed to add leaf with no inherit identifier.'
    );
  }

  identifier = RefraxTools.cleanIdentifier(identifier);
  node.leafs[identifier] = {node: leafNode, stack: detached ? stack : null};

  Object.defineProperty(accessor, identifier, {
    get: function() {
      return new RefraxSchemaPath(leafNode, node, stack.concat(leafNode.subject));
    }
  });
}

class RefraxSchemaPath {
  constructor(node, parent, stack) {
    var self = this;

    if (!(node instanceof RefraxSchemaNode)) {
      throw new TypeError(
        'RefraxSchemaPath - Expected node of type RefraxSchemaNode but found `' + typeof(node) + '`'
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

    enumerateNodeLeafs(node, stack, function(key, leafNode, leafStack) {
      Object.defineProperty(self, key, {
        get: function() {
          return new RefraxSchemaPath(leafNode, node, leafStack);
        }
      });
    });
  }

  enumerateLeafs(iteratee) {
    const node = this.__node;
    const stack = this.__stack;

    enumerateNodeLeafs(node, stack, function(key, leafNode, leafStack) {
      const accessor = new RefraxSchemaPath(leafNode, node, leafStack);
      iteratee(key, accessor);
    });
  }

  inspect(result = {}) {
    this.enumerateLeafs(function(key, accessor) {
      var descriptor = new RefraxResourceDescriptor(ACTION_INSPECT, accessor.__stack);
      result[descriptor.path] = descriptor;
      accessor.inspect(result);
    });

    return result;
  }

  invalidate(options = {}) {
    // circular dependency workaround
    (RefraxResource || (RefraxResource = require('RefraxResource')))
      .from(this, new RefraxOptions(options, {
        noFetchGet: true,
        noSubscribe: true
      }))
      .invalidate(options);
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

RefraxSchemaPath.mixins = SchemaAccescessorMixins;

export default RefraxSchemaPath;
