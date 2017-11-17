/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Resource } from '../resource/resource';
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from '../util/composableHash';
import { Configurable } from '../util/configurable';
import { Eventable } from '../util/eventable';
import {
  extend,
  invariant,
  isFunction,
  isPlainObject,
  setPrototypeOf
} from '../util/tools';
import { IStatusActionable } from '../util/types';
import { ActionEntity, ActionInvoker } from './entity';
import { IMutable } from './mutable';

export type ActionMethod = (this: ActionInvoker, data: object, ...args: any[]) => PromiseLike<object> | Error | void;
export type ActionParam = RefraxOptions | RefraxParameters | RefraxQueryParameters | string | object;

export interface IAction extends IStatusActionable, Configurable, IMutable, Eventable {
  (...args: any[]): PromiseLike<object>;
  _entity: ActionEntity;
  _stack: ActionEntity[];
  clone(): IAction;
  coextend(): IAction;
  getDefault(): object;
}

const MixinAction: object = {
  toString(this: any): string {
    return `RefraxAction(${this._stack.length}) => ${this._entity._method.toString()}`;
  },
  getDefault(this: any): object {
    let result = this._options.default || {};

    if (isFunction(result)) {
      result = result();
    }

    if (result instanceof Resource) {
      result = result.data || {};
    }
    else {
      invariant(isPlainObject(result), 'ActionInstance.getDefault failed to resolve default value');
    }

    return result;
  },
  clone(this: any): IAction {
    return factoryAction(this._stack, this);
  }
};

const MixinStatus: object = {
  isPending(this: any): boolean {
    return this._entity._promises.length > 0;
  },
  isLoading(this: any): boolean {
    const _default = this._options.default;

    return _default && typeof(_default.isLoading) === 'function' && _default.isLoading();
  },
  hasData(this: any): boolean {
    const _default = this._options.default;

    return _default && typeof(_default.hasData) === 'function' && _default.hasData()
      || Boolean(this.getDefault());
  },
  isStale(this: any): boolean {
    const _default = this._options.default;

    return _default && typeof(_default.isStale) === 'function' && _default.isStale();
  }
};

const factoryAction = (chain: any[], from?: IAction): IAction => {
  const entity = chain[chain.length - 1];

  function Action(this: any, ...args: any[]): IAction {
    invariant(!(this instanceof Action), 'Action: Is not a factory constructor');

    return entity.invoke(Action, args);
  }

  extend(Action, {
    coextend(): IAction {
      return factoryAction(chain.concat(new ActionEntity(entity._method)), (Action as any) as IAction);
    }
  });

  // Action's represent its entity (ActionEntity)
  setPrototypeOf(Action, entity);

  Object.defineProperty(Action, '_entity', { value: entity });
  Object.defineProperty(Action, '_stack', { value: chain });

  extend(Action, MixinAction);
  extend(Action, MixinStatus);

  Configurable.extend(Action, from);

  return (Action as any) as IAction;
};

export function createAction(this: any, method: ActionMethod): IAction {
  invariant(!(this instanceof createAction), 'createAction: Is not a factory constructor');
  invariant(isFunction(method), `createAction: Expected function, but found \`${method}\``);

  return factoryAction([new ActionEntity(method)]);
}
