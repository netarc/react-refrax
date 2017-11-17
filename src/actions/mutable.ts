/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Eventable } from '../util/eventable';
import { extend, invariant, isPlainObject, setPrototypeOf } from '../util/tools';
import { IKeyValue } from '../util/types';

type FunctionEmit = (event: string | symbol, ...args: any[]) => void;
export type FunctionSetter = (value: any) => void;
export type MutableState = {[key: string]: any};

export interface IMutable {
  _mutable: any;
  _errors: object;
  _state: MutableState;
  readonly data: MutableState;
  get(attribute: string, options?: IKeyValue): any;
  set(attribute: {[key: string]: any} | string, ...args: any[]): void;
  setter(attribute: {[key: string]: any} | string, options?: IKeyValue): FunctionSetter;
  unset(options?: IKeyValue): void;
  isMutated(): boolean;
  unsetErrors(options?: IKeyValue): void;
  setErrors(errors: object | null, options?: IKeyValue): void;
  getErrors(attribute?: string | null): object | string[];
  getDefault?(): object;
}

const setState = (mutable: IMutable,
                  state: MutableState,
                  attribute: string,
                  value: any,
                  options: IKeyValue,
                  emit: FunctionEmit | boolean | undefined): void => {
  const attributes = options.shallow === true ? [attribute] : attribute.split('.');
  const len = attributes.length;

  for (let i = 0; i < len; i++) {
    const attr = attributes[i];

    // If we are the last attribute then just set the value
    if (i + 1 >= len) {
      state[attr] = value;
    }
    else {
      if (state[attr] === undefined) {
        state[attr] = {};
      }

      state = state[attr];
      // tslint:disable-next-line:max-line-length
      invariant(isPlainObject(state), `mixinMutable - set expected deep attribute \`${attributes.slice(0, i + 1).join('.')}\` to be an object but found \`${state}\``);
    }
  }

  if (emit) {
    (emit as FunctionEmit).call(mutable, 'mutated', {
      type: 'attribute',
      target: attribute,
      value
    });
  }
};

const getState = (_mutable: IMutable,
                  state: MutableState,
                  attribute: string,
                  options: IKeyValue): any => {
  const attributes = options.shallow === true ? [attribute] : attribute.split('.');
  const len = attributes.length;

  for (let i = 0; i < len; i++) {
    const attr = attributes[i];

    // If we are the last attribute then just set the value
    if (i + 1 >= len) {
      return state[attr];
    }
    else {
      state = state[attr];

      if (!isPlainObject(state)) {
        break;
      }
    }
  }

  return undefined;
};

function get(this: IMutable, attribute: string, options: IKeyValue = {}): any {
  const self = this as IMutable;
  let value;

  invariant(typeof(attribute) === 'string', `mixinMutable - get expected attribute name but found \`${attribute}\``);

  value = getState(self, self._mutable._state, attribute, options);

  return value !== undefined ? value
                             : self.getDefault && getState(self, self.getDefault(), attribute, options);
}

function set(this: IMutable, attribute: {[key: string]: any} | string, ...args: any[]): void {
  const self = this as IMutable;
  const state = self._mutable._state;

  if (attribute && typeof(attribute) === 'object') {
    const options = args.shift() || {};
    const emit: Eventable['emit'] = options.noPropagate !== true && (self as any).emit;

    for (const k in attribute) {
      const v = attribute[k];

      state[k] = v;
      if (emit) {
        emit.call(self, 'mutated', {
          type: 'attribute',
          target: k,
          value: v
        });
      }
    }
  }
  else {
    let value = args.shift();
    const options = args.shift() || {};
    const emit: Eventable['emit'] = options.noPropagate !== true && (self as any).emit;
    const onSet = options.onSet;
    const optionSet = options.set;

    invariant(typeof(attribute) === 'string', `mixinMutable - set expected attribute name but found \`${attribute}\``);

    // Does our value look like an Event
    const target = value && typeof(value) === 'object' && (value.target || value.srcElement);
    if (target && 'value' in target) {
      value = target.value;
    }

    setState(self, state, attribute, value, options, emit);

    if (onSet) {
      onSet(value, attribute);
    }

    if (optionSet && typeof(optionSet) === 'object') {
      for (const k in optionSet) {
        let v = optionSet[k];

        if (typeof(v) === 'function') {
          v = v(value);
        }

        setState(self, state, k, v, options, emit);
      }
    }
  }
}

function setter(this: IMutable, attribute: string, options: IKeyValue = {}): FunctionSetter {
  const self = this as IMutable;

  invariant(typeof(attribute) === 'string', `mixinMutable - setter expected attribute name but found \`${attribute}\``);

  if (typeof(options) === 'function') {
    options = {
      onSet: options
    };
  }

  return (value: any): void => {
    self.set(attribute, value, options);
  };
}

function unset(this: IMutable, options: IKeyValue = {}): void {
  const self = this as IMutable;
  const emit: Eventable['emit'] = options.noPropagate !== true && (self as any).emit;

  // mixinMutable can be used on a prototype chain so set on mutable
  self._mutable._state = {};

  if (emit) {
    emit.call(self, 'mutated', {
      type: 'attribute',
      target: null,
      value: null
    });
  }
}

function isMutated(this: IMutable): boolean {
  const self = this as IMutable;
  const state = self._mutable._state;

  for (const k in state) {
    if (state[k] !== undefined) {
      return true;
    }
  }

  return false;
}

function unsetErrors(this: IMutable, options: IKeyValue = {}): void {
  this.setErrors(null, options);
}

function setErrors(this: IMutable, errors: object | null, options: IKeyValue = {}): void {
  const self = this as IMutable;
  const emit: Eventable['emit'] = options.noPropagate !== true && (self as any).emit;

  if (errors && !isPlainObject(errors)) {
    throw new TypeError('mixinMutable - setErrors expected errors object');
  }

  // mixinMutable can be used on a prototype chain so set on mutable
  self._mutable._errors = errors || {};

  if (emit) {
    emit.call(self, 'mutated', {
      type: 'errors',
      errors
    });
  }
}

function getErrors(this: IMutable, attribute?: string | null): object | string[] {
  const self = this as IMutable;

  return typeof(attribute) === 'string' ?
    getState(this, self._mutable._errors, attribute, {}) : self._mutable._errors;
}

export type MutableConstructor<T> = new(...args: any[]) => T;
export const mixinMutable = <T extends MutableConstructor<{}>>(Base: T):
  MutableConstructor<IMutable> & T => {
  const MixinMutable = class extends Base /*implements IMutable*/ {
    // IMutable
    _mutable: any;
    _errors: object;
    _state: MutableState;

    constructor(...args: any[]) {
      super(...args);

      // Mutable needs to reference its root self since we can be paired with a
      // prototype proxy interface and we don't want mutable data stored there.
      this._mutable = this;
      this._errors = {};
      this._state = {};
    }

    get data(): object {
      const self = (this as any) as IMutable;
      const state = extend({}, self._mutable._state);
      const defaultState = self.getDefault && self.getDefault() || {};

      return setPrototypeOf(state, defaultState);
    }
  };

  MixinMutable.prototype.get = get;
  MixinMutable.prototype.set = set;
  MixinMutable.prototype.setter = setter;
  MixinMutable.prototype.unset = unset;
  MixinMutable.prototype.isMutated = isMutated;
  MixinMutable.prototype.unsetErrors = unsetErrors;
  MixinMutable.prototype.setErrors = setErrors;
  MixinMutable.prototype.getErrors = getErrors;

  // Force acceptance of anonymous class conformity to IMutable
  return MixinMutable as any;
};

export const extendMutable = (target: any): IMutable => {
  invariant(!!target, 'extendMutable: Exepected non-null target');

  // Mutable needs to reference its root self since we can be paired with a
  // prototype proxy interface and we don't want mutable data stored there.
  target._mutable = target;
  target._errors = {};
  target._state = {};

  target.get = get;
  target.set = set;
  target.setter = setter;
  target.unset = unset;
  target.isMutated = isMutated;
  target.unsetErrors = unsetErrors;
  target.setErrors = setErrors;
  target.getErrors = getErrors;

  Object.defineProperty(target, 'data', {
    get(): object {
      const self = (this as any) as IMutable;
      const state = extend({}, self._mutable._state);
      const defaultState = self.getDefault && self.getDefault() || {};

      return setPrototypeOf(state, defaultState);
    }
  });

  return target;
};
