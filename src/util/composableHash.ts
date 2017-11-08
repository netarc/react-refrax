/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  each,
  extend,
  getPrototypeOf,
  invariant,
  isFunction,
  isPlainObject
} from './tools';
import { TComposableHashHook, TComposableHashParam } from './types';

// tslint:disable:max-classes-per-file

const enumerable = (value: boolean): any =>
  (_target: any, _propertyKey: string, descriptor: PropertyDescriptor): void => {
    descriptor.enumerable = value;
  };

/**
 * A ComposableHash is a composable wrapper around an object supporting on demand hooks.
 */
export class ComposableHash {
  [key: string]: any;
  _hooks: TComposableHashHook[];
  _isWeak: boolean;
  _weakHooks: TComposableHashHook[];

  constructor(...args: TComposableHashParam[]) {
    Object.defineProperty(this, '_weakHooks', {
      enumerable: false,
      writable: true,
      value: []
    });
    Object.defineProperty(this, '_hooks', {
      enumerable: false,
      writable: true,
      value: []
    });
    Object.defineProperty(this, '_isWeak', {
      enumerable: false,
      writable: true,
      value: false
    });

    this.extend(...args);
  }

  @enumerable(false)
  clone(): ComposableHash {
    const copy: ComposableHash = Object.create(getPrototypeOf(this));

    return copy.extend(this);
  }

  @enumerable(false)
  compose(target: any): object {
    const result = {};
    const iterator = (hook: TComposableHashHook): void => {
      const params = hook.call(target, result, target) || {};

      // tslint:disable-next-line:max-line-length
      invariant(isPlainObject(params), `ComposableHash.compose expected hook result of type 'Object'\n\rfound: '${params}'`);
      extend(result, params);
    };

    each(this._weakHooks, iterator);
    extend(result, this);
    each(this._hooks, iterator);

    return result;
  }

  @enumerable(false)
  extend(...args: TComposableHashParam[]): ComposableHash {
    each(args, (arg: TComposableHashParam) => {
      if (isPlainObject(arg)) {
        extend(this, arg);
      }
      else if (isFunction(arg)) {
        this._hooks.push(arg as TComposableHashHook);
      }
      else if (arg instanceof ComposableHash) {
        if (arg._isWeak) {
          each(arg, (val, key) => {
            if (this[key] === undefined) {
              this[key] = val;
            }
          });
          this._weakHooks = this._weakHooks.concat(arg._weakHooks, arg._hooks);
        }
        else {
          extend(this, arg);
          this._weakHooks = this._weakHooks.concat(arg._weakHooks);
          this._hooks = this._hooks.concat(arg._hooks);
        }
      }
      else {
        // tslint:disable-next-line:max-line-length
        invariant(arg === undefined || arg === null, `ComposableHash.extend expected argument of type 'Object'\n\rfound: '${arg}'`);
      }
    });

    return this;
  }

  @enumerable(false)
  hook(...fns: TComposableHashHook[]): ComposableHash {
    each(fns, (fn: TComposableHashHook) => {
      invariant(isFunction(fn), `ComposableHash.hook expected argument of type 'Function'\n\rfound: '${fn}'`);

      this._hooks.push(fn);
    });

    return this;
  }

  @enumerable(false)
  weakify(): ComposableHash {
    this._isWeak = true;

    return this;
  }
}

/**
 * A RefraxOptions is a simple subclass to identify a uniuqe ComposableHash class.
 */
export class RefraxOptions extends ComposableHash {
}

/**
 * A RefraxParameters is a simple subclass to identify a uniuqe ComposableHash class.
 */
export class RefraxParameters extends ComposableHash {
}

/**
 * A RefraxQueryParameters is a simple subclass to identify a uniuqe ComposableHash class.
 */
export class RefraxQueryParameters extends ComposableHash {
}
