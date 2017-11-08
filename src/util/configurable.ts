/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from './composableHash';
import { invariant } from './tools';
import { TComposableHashParam } from './types';

function withOptions(this: Configurable, ...args: TComposableHashParam[]): Configurable {
  const clone = (this as Configurable).clone && (this as Configurable).clone!() || this;
  clone._options.extend(...args);

  return clone;
}

function withParams(this: Configurable, ...args: TComposableHashParam[]): Configurable {
  const clone = (this as Configurable).clone && (this as Configurable).clone!() || this;
  clone._parameters.extend(...args);

  return clone;
}

function withQueryParams(this: Configurable, ...args: TComposableHashParam[]): Configurable {
  const clone = (this as Configurable).clone && (this as Configurable).clone!() || this;
  clone._queryParams.extend(...args);

  return clone;
}

function seIKeyValue(this: Configurable, ...args: TComposableHashParam[]): void {
  this._options.extend(...args);
}

function setParams(this: Configurable, ...args: TComposableHashParam[]): void {
  this._parameters.extend(...args);
}

function setQueryParams(this: Configurable, ...args: TComposableHashParam[]): void {
  this._queryParams.extend(...args);
}

// Shadow Interface for our Class so we can specify prototype methods manually
// tslint:disable-next-line: interface-name
export interface Configurable {
  _options: RefraxOptions;
  _parameters: RefraxParameters;
  _queryParams: RefraxQueryParameters;
  clone?(): Configurable;
  withParams(...args: TComposableHashParam[]): this;
  withOptions(...args: TComposableHashParam[]): this;
  withQueryParams(...args: TComposableHashParam[]): this;
  seIKeyValue(...args: TComposableHashParam[]): void;
  setParams(...args: TComposableHashParam[]): void;
  setQueryParams(...args: TComposableHashParam[]): void;
}

export type ConfigurableConstructor<T> = new(...args: any[]) => T;

export const mixinConfigurable = <T extends ConfigurableConstructor<{}>>(Base: T):
    ConfigurableConstructor<Configurable> & T => {
  const ClassConfigurable = class extends Base /*implements Configurable*/ {
    _options: RefraxOptions;
    _parameters: RefraxParameters;
    _queryParams: RefraxQueryParameters;

    constructor(...args: any[]) {
      super(...args);

      this._options = new RefraxOptions();
      this._parameters = new RefraxParameters();
      this._queryParams = new RefraxQueryParameters();
    }
  };

  ClassConfigurable.prototype.withOptions = withOptions;
  ClassConfigurable.prototype.withParams = withParams;
  ClassConfigurable.prototype.withQueryParams = withQueryParams;
  ClassConfigurable.prototype.seIKeyValue = seIKeyValue;
  ClassConfigurable.prototype.setParams = setParams;
  ClassConfigurable.prototype.setQueryParams = setQueryParams;

  // Force compliance as Configurable
  return ClassConfigurable as any;
};

export const extendConfigurable = (target?: any, from?: Configurable): Configurable => {
  invariant(Boolean(target), 'extendConfigurable: Exepected non-null target');

  target._options = new RefraxOptions(from && from._options);
  target._parameters = new RefraxParameters(from && from._parameters);
  target._queryParams = new RefraxQueryParameters(from && from._queryParams);
  target.withOptions = withOptions;
  target.withParams = withParams;
  target.withQueryParams = withQueryParams;
  target.seIKeyValue = seIKeyValue;
  target.setParams = setParams;
  target.setQueryParams = setQueryParams;

  return target;
};
export class Configurable {
  static mixin: <T extends ConfigurableConstructor<{}>>(Base: T) =>
    ConfigurableConstructor<Configurable> & T = mixinConfigurable;
  static extend: (target?: any, from?: Configurable) =>
    Configurable = extendConfigurable;

  _options: RefraxOptions;
  _parameters: RefraxParameters;
  _queryParams: RefraxQueryParameters;

  constructor() {
    this._options = new RefraxOptions();
    this._parameters = new RefraxParameters();
    this._queryParams = new RefraxQueryParameters();
  }
}

Configurable.prototype.withOptions = withOptions;
Configurable.prototype.withParams = withParams;
Configurable.prototype.withQueryParams = withQueryParams;
Configurable.prototype.seIKeyValue = seIKeyValue;
Configurable.prototype.setParams = setParams;
Configurable.prototype.setQueryParams = setQueryParams;
