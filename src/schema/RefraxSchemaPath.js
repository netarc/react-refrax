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
const RefraxParameters = require('RefraxParameters');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxConstants = require('RefraxConstants');
const mixinConfigurable = require('mixinConfigurable');
const warning = require('warning');
const ACTION_INSPECT = RefraxConstants.action.inspect;
const ACTION_GET = RefraxConstants.action.get;
const SchemaAccescessorMixins = [];


// Determine if a stack matches the ending of another
function compareStack(part, stack) {
  stack = stack.slice(Math.max(stack.length - part.length, 0));
  return JSON.stringify(part) === JSON.stringify(stack);
}

function enumerateNodeLeafs(node, stack, action) {
  RefraxTools.each(node.leafs, function(leaf, key) {
    if (!leaf.stack || compareStack(leaf.stack, stack)) {
      action(key, leaf.node, stack.concat(leaf.node));
    }
  });
}

function createLeaf(schemaPath, detached, identifier, leafNode) {
  var node = schemaPath.__node
    , stack = schemaPath.__stack;

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

  Object.defineProperty(schemaPath, identifier, {
    get: function() {
      return new RefraxSchemaPath(leafNode, stack.concat(leafNode));
    }
  });
}

class RefraxSchemaPath {
  constructor(node, stack, clone) {
    var self = this;

    if (!(node instanceof RefraxSchemaNode)) {
      throw new TypeError(
        'RefraxSchemaPath - Expected node of type RefraxSchemaNode but found `' + typeof(node) + '`'
      );
    }

    if (!stack) {
      stack = [].concat(node);
    }

    Object.defineProperty(this, '__node', {value: node});
    Object.defineProperty(this, '__stack', {value: stack});

    RefraxTools.each(SchemaAccescessorMixins, function(mixin) {
      RefraxTools.extend(this, mixin);
    });

    mixinConfigurable(this, clone);

    enumerateNodeLeafs(node, stack, function(key, leafNode, leafStack) {
      Object.defineProperty(self, key, {
        get: function() {
          return new RefraxSchemaPath(leafNode, leafStack);
        }
      });
    });
  }

  toString() {
    return 'RefraxSchemaPath';
  }

  clone() {
    return new RefraxSchemaPath(this.__node, this.__stack, this);
  }

  enumerateLeafs(iteratee) {
    enumerateNodeLeafs(this.__node, this.__stack, (key, leafNode, leafStack) => {
      const schemaPath = new RefraxSchemaPath(leafNode, leafStack.concat([
        this._options,
        this._parameters,
        this._queryParams
      ]));
      iteratee(key, schemaPath);
    });
  }

  inspect(result = {}) {
    this.enumerateLeafs(function(key, schemaPath) {
      var descriptor = new RefraxResourceDescriptor(null, ACTION_INSPECT, schemaPath.__stack);
      result[descriptor.path] = descriptor;
      schemaPath.inspect(result);
    });

    return result;
  }

  invalidate(options = {}) {
    if (!RefraxTools.isPlainObject(options)) {
      throw new TypeError(
        `invalidate expected argument of type \`Object\` but found ${options}`
      );
    }

    const stack = this.__stack.concat(
      this._options,
      this._parameters,
      this._queryParams
    );

    // @deprecated
    if (options.params) {
      warning(
        false,
        '`SchemaPath.invalidate use of option `params` is deprecated. Please use' +
          ' `SchemaPath.withParams(...) instead.',
      );

      stack.push(new RefraxParameters(options.params));
    }

    // @deprecated
    if (options.paramsGenerator) {
      warning(
        false,
        '`SchemaPath.invalidate use of option `paramsGenerator` is deprecated. Please use' +
          ' `SchemaPath.withParams(...) instead.',
      );

      stack.push(new RefraxParameters(options.paramsGenerator));
    }

    const descriptor = new RefraxResourceDescriptor(null, ACTION_GET, stack);

    if (descriptor.valid) {
      if (descriptor.store) {
        descriptor.store.invalidate(descriptor, options);
      }

      if (options.cascade === true) {
        this.invalidateLeafs(options);
      }
    }
  }

  invalidateLeafs(options = {}) {
    if (!RefraxTools.isPlainObject(options)) {
      throw new TypeError(
        `invalidateLeafs expected argument of type \`Object\` but found ${options}`
      );
    }

    const stackTop = [
      new RefraxOptions({
        errorOnInvalid: options.errorOnInvalid != undefined ? options.errorOnInvalid : options.cascade != true
      })
    ];

    // @deprecated
    if (options.params) {
      warning(
        false,
        '`SchemaPath.invalidate use of option `params` is deprecated. Please use' +
          ' `SchemaPath.withParams(...) instead.',
      );

      stackTop.push(new RefraxParameters(options.params));
    }

    // @deprecated
    if (options.paramsGenerator) {
      warning(
        false,
        '`SchemaPath.invalidate use of option `paramsGenerator` is deprecated. Please use' +
          ' `SchemaPath.withParams(...) instead.',
      );

      stackTop.push(new RefraxParameters(options.paramsGenerator));
    }

    this.enumerateLeafs(function(key, schemaPath) {
      var stack = [].concat(schemaPath.__stack, stackTop)
        , descriptor = new RefraxResourceDescriptor(null, ACTION_GET, stack);

      if (descriptor.valid) {
        if (descriptor.store) {
          descriptor.store.invalidate(descriptor, options);
        }

        if (options.cascade === true) {
          schemaPath.invalidateLeafs(options);
        }
      }
    });
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
