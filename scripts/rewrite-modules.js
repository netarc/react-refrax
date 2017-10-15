/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');


/**
 * Rewrites module string literal according to an options entry.
 */
function mapModuleEntry(module, entry, output) {
  if (typeof(entry) === 'string') {
    return entry === module && (output || module);
  }
  else if (typeof(entry) === 'object') {
    const entryAsString = Object.prototype.toString.call(entry);

    if (entryAsString === '[object Array]') {
      return mapModuleEntry(module, entry[0], entry[1]);
    }
    else if (entryAsString === '[object RegExp]') {
      return entry.test(module) && (output || module);
    }
  }

  return false;
}

/**
 * Rewrites module string literals according to the `modules` options.
 */
function mapModule(state, module) {
  const modules = state.opts.modules || [];

  for (let i = 0; i < modules.length; i++) {
    const result = mapModuleEntry(module, modules[i]);

    if (result !== false) {
      return result;
    }
  }

  return './' + path.basename(module);
}

module.exports = function(babel) {
  const t = babel.types;
  const SEEN_SYMBOL = Symbol();

  /**
   * Transforms `require('Foo')`
   */
  function transformRequireCall(path, state) {
    const calleePath = path.get('callee');

    if (!t.isIdentifier(calleePath.node, {name: 'require'})) {
      return;
    }

    const args = path.get('arguments');
    if (args.length > 0) {
      const moduleArg = args[0];

      if (moduleArg.node.type === 'StringLiteral') {
        const module = mapModule(state, moduleArg.node.value);

        if (module) {
          moduleArg.replaceWith(t.stringLiteral(module));
        }
      }
    }
  }

  /**
   * Transforms `import type Bar from 'foo'`
   */
  function transformImport(path, state) {
    const source = path.get('source');

    if (source.type === 'StringLiteral') {
      const module = mapModule(state, source.node.value);

      if (module) {
        source.replaceWith(t.stringLiteral(module));
      }
    }
  }

  return {
    visitor: {
      CallExpression: {
        exit(path, state) {
          if (!path[SEEN_SYMBOL]) {
            path[SEEN_SYMBOL] = true;
            transformRequireCall(path, state);
          }
        }
      },
      ImportDeclaration: {
        exit(path, state) {
          if (!path[SEEN_SYMBOL]) {
            path[SEEN_SYMBOL] = true;
            transformImport(path, state);
          }
        }
      }
    }
  };
};
