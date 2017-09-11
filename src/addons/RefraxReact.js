/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxResource = require('RefraxResource');
const RefraxMutableResource = require('RefraxMutableResource');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxActionEntity = require('RefraxActionEntity');
const RefPool = {};

export const Shims = {
  getComponentParams: function() {
    return RefraxTools.extend({}, this.props);
  }
};

function detect(array, targets, predicate) {
  refraxifyComponent(this);

  return RefraxTools.any(array, function(other) {
    if (targets && targets.length > 0 && targets.indexOf(other) === -1) {
      return false;
    }

    return predicate(other);
  });
}

const MixinResourceStatus = {
  isLoading: function(...targets) {
    return detect.call(this, this.__refrax.resources, targets, function(resource) {
      return resource.isLoading();
    }) || detect.call(this, this.__refrax.actions, targets, function(action) {
      return action.isLoading();
    });
  },
  isPending: function(...targets) {
    return detect.call(this, this.__refrax.actions, targets, function(action) {
      return action.isPending();
    });
  },
  hasData: function(...targets) {
    return !detect.call(this, this.__refrax.resources, targets, function(resource) {
      return !resource.hasData();
    }) && !detect.call(this, this.__refrax.actions, targets, function(action) {
      return !action.hasData();
    });
  },
  isStale: function(...targets) {
    return !detect.call(this, this.__refrax.resources, targets, function(resource) {
      return resource.isStale();
    }) && !detect.call(this, this.__refrax.actions, targets, function(action) {
      return action.isStale();
    });
  },
  isMutated: function(...targets) {
    return detect.call(this, this.__refrax.actions, targets, function(action) {
      return action.isMutated();
    });
  }
};

const MixinBase = {
  attach: function(target, options, ...args) {
    return attach(this, target, options, ...args);
  },
  mutableFrom: function(accessor, ...args) {
    const componentParams = () => {
      return Shims.getComponentParams.call(this);
    };

    // Mutable has no need for data arguments so convert them to params
    args = RefraxTools.map(args, function(arg) {
      if (RefraxTools.isPlainObject(arg)) {
        return new RefraxParameters(arg);
      }
      return arg;
    });

    return new RefraxMutableResource(accessor, new RefraxParameters(componentParams), ...args);
  }
};

function refraxifyComponent(component) {
  if (component.__refrax) {
    return;
  }

  Object.defineProperty(component, '__refrax', {
    value: {
      disposed: false,
      resources: [],
      actions: [],
      disposers: []
    }
  });

  // quick-check for
  if (component.attach !== MixinBase.attach) {
    RefraxTools.extend(component, MixinBase, MixinResourceStatus);
  }

  // Hook existing componentWillUnmount for cleanup
  var _componentWillUnmount = component.componentWillUnmount;
  component.componentWillUnmount = function() {
    RefraxTools.each(component.__refrax.disposers, function(disposer) {
      disposer();
    });
    RefraxTools.each(component.__refrax.resources, function(resource) {
      resource.dispose();
    });
    component.__refrax.disposers = [];
    component.__refrax.actions = [];
    component.__refrax.resources = [];
    component.__refrax.disposed = true;

    if (_componentWillUnmount) {
      _componentWillUnmount.call(component);
    }
  };
}

// TODO: Is it ok that an action trigger to update an end-point would trigger (2) renders in
// short succession? First for the action trigger, second for the touch on the endpoint..
// Maybe would be nice to replace this with some "event-id" approach so they are
// considered as "one" render event?
function dispatchRender(component, noDelay) {
  if (noDelay) {
    component.forceUpdate();
  }
  else {
    // subscription events occur during request/udpate promise chains, delaying
    // until nextTick allows promise hooks to react before a potential re-render occurs
    RefraxTools.nextTick(function() {
      if (component.__refrax.disposed) {
        return;
      }
      component.forceUpdate();
    });
  }
}

function attachAccessor(component, accessor, options, ...args) {
  var resource;

  // If options doesn't look like an option lets just prepend to args
  if (options && !RefraxTools.isPlainObject(options)) {
    args.unshift(options);
    options = null;
  }

  const componentParams = () => {
    return Shims.getComponentParams.call(component);
  };

  resource = new RefraxResource(accessor,
    new RefraxOptions(options),
    new RefraxParameters(componentParams),
    ...args
  );
  component.__refrax.resources.push(resource);
  component.__refrax.disposers.push(resource.subscribe('change', function() {
    dispatchRender(component);
  }));
  return resource;
}

function attachAction(component, Action, options = {}) {
  var action
    , refLink
    , refPool;

  if (refLink = options.refLink) {
    refPool = RefPool[refLink];

    if (!refPool) {
      refPool = RefPool[refLink] = {
        Action: Action,
        action: Action.coextend(),
        components: []
      };
    }

    if (Action !== refPool.Action) {
      throw new TypeError(
        'attachAction cannot link different actions.\n\r' +
        'found: ' + Action + '\n\r' +
        'expected: ' + refPool.Action
      );
    }

    action = refPool.action.clone();

    refPool.components.push(component);
    component.__refrax.disposers.push(() => {
      refPool.components.splice(refPool.components.indexOf(component), 1);
      if (refPool.components.length < 1) {
        delete RefPool[refLink];
      }
    });
  }
  else {
    // referencing an attached action (IE resource `default` to an attached resourced)
    if (Action.attached === true) {
      action = Action.clone();
    }
    else {
      action = Action.coextend();
    }
    action.attached = true;
  }

  action.setOptions(options);
  action.setParams(() => {
    return Shims.getComponentParams.call(component);
  });

  component.__refrax.actions.push(action);
  // TODO: finish/mutated can cause double updates due to a request failure
  RefraxTools.each(['start', 'finish', 'mutated'], function(event) {
    component.__refrax.disposers.push(action.subscribe(event, function() {
      dispatchRender(component, event === 'start');
    }));
  });

  return action;
}

export function attach(component, target, options, ...args) {
  refraxifyComponent(component);

  if (target instanceof RefraxSchemaPath) {
    return attachAccessor(component, target, options, ...args);
  }
  else if (target instanceof RefraxActionEntity) {
    return attachAction(component, target, options);
  }

  throw new TypeError('RefraxReact::attach cannot attach invalid target `' + target + '`.');
}

/**
 * Extend lives as a function so we can use it on ES6 React component classes, but
 * we extend with the MixinBase so it can be used in legacy React component classes.
 */
export function extend(component) {
  // ES6 - class XYZ extends RefraxReact.extend(React.Component)
  if (typeof(component) === 'function') {
    component = (class extends component {});
    RefraxTools.extend(component.prototype, MixinBase, MixinResourceStatus);
  }
  // Manual - RefraxReact.extend(this)
  else {
    refraxifyComponent(component);
  }

  return component;
}

export const Mixin = {
  componentWillMount: function() {
    refraxifyComponent(this);
  }
};

RefraxTools.extend(Mixin, MixinBase);

export default {
  Shims,
  attach,
  extend,
  Mixin
};
