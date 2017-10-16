/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  extend,
  select,
  each,
  cleanIdentifier,
  isPlainObject,
  warning
} from 'RefraxTools';
import RefraxSchemaNode from 'RefraxSchemaNode';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import RefraxConstants from 'RefraxConstants';
import mixinConfigurable from 'mixinConfigurable';
import createSchemaCollection from 'createSchemaCollection';
import createSchemaResource from 'createSchemaResource';
import createSchemaNamespace from 'createSchemaNamespace';

const ACTION_INSPECT = RefraxConstants.action.inspect;
const ACTION_GET = RefraxConstants.action.get;
const SchemaAccescessorMixins = [];


// @todo Do we need serialization comparison or is strict equality good enough?
// function serializer() {
//   var stack = []
//     , keys = [];
//
//   return function(key, value) {
//     if (stack.length > 0) {
//       const thisPos = stack.indexOf(this);
//       if (~thisPos) {
//         stack.splice(thisPos + 1);
//         keys.splice(thisPos, Infinity, key);
//       }
//       else {
//         stack.push(this);
//         keys.push(key);
//       }
//
//       const valuePos = stack.indexOf(value);
//       if (~valuePos) {
//         if (stack[0] === value) {
//           value = '[Circular ~]';
//         }
//         else {
//           value = '[Circular ~.' + keys.slice(0, valuePos).join('.') + ']';
//         }
//       }
//     }
//     else {
//       stack.push(value);
//     }
//
//     return value;
//   };
// }
//
// function stringify(obj) {
//   return JSON.stringify(obj, serializer());
// }

// Determine if a "part" of a stack is comparable to another based on nodes only
function compareStackNodes(part, stack) {
  part = select(part, (obj) => {
    return obj instanceof RefraxSchemaNode;
  });
  stack = select(stack, (obj) => {
    return obj instanceof RefraxSchemaNode;
  });
  stack = stack.slice(Math.max(stack.length - part.length, 0));

  if (stack.length != part.length) {
    return false;
  }

  for (var i=0, size=stack.length; i<size; i++) {
    if (stack[i] !== part[i]) {
      return false;
    }
  }
  return true;
  // return stringify(part) === stringify(stack);
}

function enumerateNodeLeafs(node, stack, action) {
  each(node.leafs, function(leaf, key) {
    if (leaf.stack === null || compareStackNodes(leaf.stack, stack)) {
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

  identifier = cleanIdentifier(identifier);
  node.leafs[identifier] = { node: leafNode, stack: detached ? stack : null };

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
      stack = [node];
    }

    Object.defineProperty(this, '__node', { value: node });
    Object.defineProperty(this, '__stack', { value: stack });

    each(SchemaAccescessorMixins, function(mixin) {
      extend(this, mixin);
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
    if (!isPlainObject(options)) {
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
    if (!isPlainObject(options)) {
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

  addCollection(path, store, options) {
    const collection = createSchemaCollection()(path, store, options);
    createLeaf(this, true, collection);
    return collection;
  }

  addResource(path, store, options) {
    const resource = createSchemaResource()(path, store, options);
    createLeaf(this, true, resource);
    return resource;
  }

  addNamespace(path, store, options) {
    const namespace = createSchemaNamespace()(path, store, options);
    createLeaf(this, true, namespace);
    return namespace;
  }
}

RefraxSchemaPath.mixins = SchemaAccescessorMixins;

export default RefraxSchemaPath;
