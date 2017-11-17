/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';

import { MutableResource } from '../resource/mutableResource';
import { SchemaPath } from '../schema/path';
import { Eventable } from '../util/eventable';
import { RequestError } from '../util/requestError';
import { each, extend, isPlainObject, isPromise } from '../util/tools';
import { ActionMethod, IAction } from './action';
import * as mutable from './mutable';

export class ActionInvoker {
  _action: IAction;

  constructor(action: IAction) {
    this._action = action;
  }

  mutableFrom(schemaPath: SchemaPath, ...args: any[]): MutableResource {
    const action = this._action;
    const stack = ([] as any[]).concat(
      action._options,
      action._parameters,
      action._queryParams,
      args
    );

    return MutableResource.from(schemaPath, ...stack);
  }

  invalidate(items?: SchemaPath[], options?: object): void {
    const action = this._action;
    items = ([] as any[]).concat(items || []);

    each(items, (item: SchemaPath) => {
      item
        .withParams(action._parameters)
        .withQueryParams(action._queryParams)
        .invalidate(options);
    });
  }
}

export class ActionEntity extends mutable.mixinMutable(Eventable) {
  _method: ActionMethod;
  _invokers: ActionInvoker[];

  constructor(method: ActionMethod) {
    super();

    this._method = method;
    this._invokers = [];
  }

  toString(): string {
    return `RefraxActionEntity => ${this._method.toString()}`;
  }

  invoke(Action: IAction, ...args: any[]): Promise<any> {
    const options = Action._options;
    const stack = Action._stack;
    const stackSize = stack.length;
    const invoker = new ActionInvoker(Action);
    let promise: any;
    let result: any;

    // Reset errors on invocation
    Action.setErrors({});
    const data = extend(
      {},
      options.includeDefault === true ? Action.getDefault() : null,
      this._state,
      args.shift()
    );

    for (let i = 0; i < stackSize; i++) {
      stack[i]._invokers.push(invoker);
      stack[i].emit('start', invoker);
    }

    promise = result = this._method.apply(invoker, [data].concat(args));

    if (!isPromise(result)) {
      promise = new Promise((resolve: (result: any) => void, reject: (result: any) => void) => {
        if (result instanceof Error) {
          reject(result);
        }
        else {
          resolve(result);
        }
      });
    }

    const finalize = () => {
      for (let i = 0; i < stackSize; i++) {
        const n = stack[i]._invokers.indexOf(invoker);
        if (n > -1) {
          stack[i]._invokers.splice(n, 1);
        }
        stack[i].emit('finish', invoker);
      }
    };
    promise.then((value: any[]) => {
      this.unset();
      finalize();

      return value;
    });
    promise.catch((err: Error) => {
      if (err instanceof RequestError) {
        if (isPlainObject((err as RequestError).response.data)) {
          Action.setErrors(extend({}, (err as RequestError).response.data));
        }
      }

      finalize();
      throw err;
    });

    return promise;
  }
}
