/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const mixinConfigurable = require('mixinConfigurable');
const RefraxResource = require('RefraxResource');
const RefraxActionEntity = require('RefraxActionEntity');
const RefraxTools = require('RefraxTools');

const MixinAction = {
  getDefault: function() {
    var result = this._options.default || {};

    if (RefraxTools.isFunction(result)) {
      result = result();
    }

    if (result instanceof RefraxResource) {
      result = result.data || {};
    }
    else if (!RefraxTools.isPlainObject(result)) {
      throw new TypeError('ActionInstance ' + this + ' failed to resolve default value');
    }

    return result;
  },
  clone: function() {
    return _createAction(this._stack, this);
  }
};

const MixinStatus = {
  isPending: function() {
    return this._entity._promises.length > 0;
  },
  isLoading: function() {
    var _default = this._options.default;
    return _default && typeof(_default.isLoading) === 'function' && _default.isLoading();
  },
  hasData: function() {
    var _default = this._options.default;
    return _default && typeof(_default.hasData) === 'function' && _default.hasData()
      || !!this.getDefault();
  },
  isStale: function() {
    var _default = this._options.default;
    return _default && typeof(_default.isStale) === 'function' && _default.isStale();
  }
};

function _createAction(stack, from = null) {
  const entity = stack[stack.length-1];

  function Action(...args) {
    if (this instanceof Action) {
      throw new TypeError('direct Action instantiation is deprecated; use Action.coextend instead');
    }
    else {
      return entity.invoke(Action, args);
    }
  }

  Action.coextend = function() {
    return _createAction(stack.concat(new RefraxActionEntity(entity._method)), Action);
  };

  Action.toString = function() {
    return 'RefraxAction(' + stack.length + ') => ' + entity._method.toString();
  };

  // Action's represent its entity
  RefraxTools.setPrototypeOf(Action, entity);

  Object.defineProperty(Action, '_entity', {value: entity});
  Object.defineProperty(Action, '_stack', {value: stack});

  RefraxTools.extend(Action, MixinAction);
  RefraxTools.extend(Action, MixinStatus);

  mixinConfigurable(Action, from);

  return Action;
}

function createAction(method) {
  if (this instanceof createAction) {
    throw new TypeError('Cannot directly instantiate createAction');
  }

  if (!RefraxTools.isFunction(method)) {
    throw new TypeError('createAction: Expected function, but found `' + method + '`');
  }

  return _createAction([new RefraxActionEntity(method)]);
}

export default createAction;
