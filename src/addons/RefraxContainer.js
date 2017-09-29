/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const RefraxTools = require('RefraxTools');
const React = require('react');
const RefraxReactShims = require('RefraxReactShims');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxActionEntity = require('RefraxActionEntity');
const RefraxResource = require('RefraxResource');
const RefraxParameters = require('RefraxParameters');
const RefPool = {};

/* eslint-disable indent */

function detect(array, targets, predicate) {
  return RefraxTools.any(array, function(other) {
    if (targets && targets.length > 0 && targets.indexOf(other) === -1) {
      return false;
    }

    return predicate(other);
  });
}

function renderDispatch(component) {
  component.setState({ lastUpdate: Date.now() });
}

function renderDispatcher(component) {
  let timeout = null;
  return (debounced) => {
    if (debounced === true) {
      if (timeout == null) {
        timeout = setTimeout(() => {
          if (timeout != null) {
            renderDispatch(component);
          }
        }, 2);
      }
    }
    else {
      clearTimeout(timeout);
      timeout = null;
      renderDispatch(component);
    }
  };
}

function attachAccessor(container, accessor) {
  const componentParams = () => {
    return RefraxReactShims.getComponentParams.call(container);
  };

  const resource = new RefraxResource(accessor,
    new RefraxParameters(componentParams).weakify()
  );

  container._disposers.push(resource.subscribe('change', () => {
    renderDispatch(container);
  }));

  const descriptor = resource._generateDescriptor();
  RefraxTools.extend(container._paramsUsed, descriptor.pathParams, descriptor.queryParams);

  return resource;
}

function attachAction(container, Action) {
  var action
    , refLink
    , refPool;

  if (refLink = Action._options.refLink) {
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

    refPool.components.push(container);
    container._disposers.push(() => {
      refPool.components.splice(refPool.components.indexOf(container), 1);
      if (refPool.components.length < 1) {
        delete RefPool[refLink];
      }
    });
  }
  else {
    // Referencing an attached action (IE resource `default` to an attached resourced)
    if (Action.attached === true) {
      action = Action.clone();
    }
    else {
      action = Action.coextend();
    }
    action.attached = true;
  }

  action.setParams(
    new RefraxParameters(() => {
      return RefraxReactShims.getComponentParams.call(container);
    }).weakify()
  );

  // We delay-debounce since `mutated` can often fire along-side `start`/`finish`
  const dispatchRender = renderDispatcher(container);
  RefraxTools.each(['start', 'finish', 'mutated'], (event) => {
    container._disposers.push(action.subscribe(event, () => {
      dispatchRender(event === 'mutated');
    }));
  });

  return action;
}

function attach(target) {
  if (target instanceof RefraxSchemaPath) {
    const resource = attachAccessor(this, target);

    this._resources.push(resource);
    return resource;
  }
  else if (target instanceof RefraxActionEntity) {
    const action = attachAction(this, target);

    this._actions.push(action);
    return action;
  }

  throw new TypeError('RefraxContainer::attach cannot attach invalid target `' + target + '`.');
}

function isScalarAndEqual(valueA, valueB) {
  return valueA === valueB && (valueA === null || typeof valueA !== 'object');
}

function paramsEqual(lastUsedParams, availableParams) {
  for (const key in lastUsedParams) {
    if (!isScalarAndEqual(lastUsedParams[key], availableParams[key])) {
      return false;
    }
  }

  return true;
}

function isReactComponent(component) {
  return !!(
    component &&
    typeof component.prototype === 'object' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
}

function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (superClass) {
    RefraxTools.setPrototypeOf(subClass, superClass);
  }
}

function refraxify(Component) {
  function SuperComponent() {}
  inherits(SuperComponent, Component);

  SuperComponent.prototype.isLoading = function() {
    return this.props.refraxContainer.isLoading();
  };
  SuperComponent.prototype.isPending = function() {
    return this.props.refraxContainer.isPending();
  };
  SuperComponent.prototype.hasData = function() {
    return this.props.refraxContainer.hasData();
  };
  SuperComponent.prototype.isStale = function() {
    return this.props.refraxContainer.isStale();
  };

  return SuperComponent;
}

function createContainer(Component, initHook) {
  Component = refraxify(Component);

  const ComponentClass = isReactComponent(Component) && Component;
  const componentName = Component.displayName || Component.name;
  const containerName = 'Refrax(' + componentName + ')';

  class RefraxContainer extends React.Component {
    constructor(props, context) {
      super(props, context);

      this.mounted = true;
      this._disposers = [];
      this._resources = [];
      this._actions = [];
      this._paramsUsed = {};

      this.state = {
        lastUpdate: null,
        attachments: {}
      };
    }

    _initialize() {
      const result = initHook.call(this) || {};
      const attachments = {};
      RefraxTools.each(result, (atachment, key) => {
        attachments[key] = attach.call(this, atachment);
      });

      return {
        attachments: attachments
      };
    }

    _cleanup() {
      RefraxTools.each(this._disposers, (disposer) => {
        disposer();
      });

      RefraxTools.each(this._resources, (resource) => {
        resource.dispose();
      });

      this._disposers = [];
      this._resources = [];
      this._actions = [];
    }

    componentWillMount() {
      this.setState(this._initialize());
    }

    componentWillUnmount() {
      this._cleanup();
      this.mounted = false;
    }

    componentWillReceiveProps(nextProps, maybeNextContext) {
      const availableParams = RefraxReactShims.getComponentParams.call({
        props: nextProps,
        context: maybeNextContext || this.context
      });

      // If we compare all params used by resources and detect a difference we need to re-init
      if (!paramsEqual(this._paramsUsed, availableParams)) {
        // @todo: The problem with a full cleanup and re-init is any binding done outside initHook
        // will be lost
        this._cleanup();
        this._initialize();
      }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
      // @todo: Do we need a prop/state check?
      return true;
    }

    render() {
      if (ComponentClass) {
        return (
          <ComponentClass {...this.props}
                          {...this.state.attachments}
                          ref='component'
                          refraxContainer={this} />
        );
      }
      else {
        return React.createElement(Component, {
          ...this.props,
          ...this.state.attachments,
          ref: 'component',
          refraxContainer: this
        });
      }
    }

    isLoading(...targets) {
      return detect(this._resources, targets, function(resource) {
        return resource.isLoading();
      }) || detect(this._actions, targets, function(action) {
        return action.isLoading();
      });
    }

    isPending(...targets) {
      return detect(this._actions, targets, function(action) {
        return action.isPending();
      });
    }

    hasData(...targets) {
      return !detect(this._resources, targets, function(resource) {
        return !resource.hasData();
      }) && !detect(this._actions, targets, function(action) {
        return !action.hasData();
      });
    }

    isStale(...targets) {
      return detect(this._resources, targets, function(resource) {
        return resource.isStale();
      }) || detect(this._actions, targets, function(action) {
        return action.isStale();
      });
    }
  }

  RefraxContainer.displayName = containerName;
  RefraxContainer.contextTypes = RefraxTools.extend({}, RefraxReactShims.contextTypes);

  return RefraxContainer;
}

export function create(...args) {
  var Component
    , initHook
    , arg;

  while (arg = args.shift()) {
    if (isReactComponent(arg)) {
      Component = arg;
    }
    else if (typeof(arg) === 'function') {
      initHook = arg;
    }
    else {
      throw new TypeError(
        'createContainer invalid argument; expected React Component or Pure Render Function but ' +
        'found `' + arg + '`'
      );
    }
  }

  return createContainer(Component, initHook);
}
