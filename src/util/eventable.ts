/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { EventEmitter, ListenerFn } from 'eventemitter3';

import { Disposable } from './disposable';
import { invariant } from './tools';

function on(this: Eventable, event: string, callback: ListenerFn, context?: any): Disposable {
  let disposable: Disposable;
  let eventHandler: ListenerFn;

  context = context || this;

  invariant(typeof(event) === 'string', `Eventable.on expected string event but found type \`${event}\'`);
  invariant(typeof(callback) === 'function', `Eventable.on expected callback but found \`${callback}\``);

  disposable = new Disposable(() => {
    this._emitter.removeListener(event, eventHandler);
  });

  eventHandler = (... args: any[]) => {
    if (disposable.disposed) {
      return;
    }
    callback.apply(context, args);
  };

  this._emitter.addListener(event, eventHandler);

  return disposable;
}

function once(this: Eventable, event: string, callback: ListenerFn, context?: any): Disposable {
  let disposable: Disposable;
  let eventHandler: ListenerFn;

  context = context || this;

  invariant(typeof(event) === 'string', `Eventable.once expected string event but found type \`${event}\'`);
  invariant(typeof(callback) === 'function', `Eventable.once expected callback but found \`${callback}\``);

  disposable = new Disposable(() => {
    this._emitter.removeListener(event, eventHandler);
  });

  eventHandler = (... args: any[]) => {
    if (disposable.disposed) {
      return;
    }
    callback.apply(context, args);
    disposable.dispose();
  };

  this._emitter.addListener(event, eventHandler);

  return disposable;
}

function emit(this: Eventable, event: string | symbol, ...args: any[]): void {
  return this._emitter.emit.call(this._emitter, event, ...args);
}

// Shadow Interface for our Class so we can specify prototype methods manually
// tslint:disable-next-line: interface-name
export interface Eventable {
  _emitter: EventEmitter;
  on(event: string, callback: ListenerFn, context?: any): Disposable;
  once(event: string, callback: ListenerFn, context?: any): Disposable;
  emit(event: string | symbol, ...args: any[]): void;
}

export class Eventable {
  _emitter: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();
  }
}

Eventable.prototype.on = on;
Eventable.prototype.once = once;
Eventable.prototype.emit = emit;

export type EventableConstructor<T> = new(...args: any[]) => T;

export const mixinEventable = <T extends EventableConstructor<{}>>(Base: T):
    EventableConstructor<Eventable> & T => {
  const ClassEventable = class extends Base /*implements Eventable*/ {
    _emitter: EventEmitter;

    constructor(...args: any[]) {
      super(...args);

      this._emitter = new EventEmitter();
    }
  };

  ClassEventable.prototype.on = on;
  ClassEventable.prototype.once = once;
  ClassEventable.prototype.emit = emit;

  // Force compliance as Eventable
  return ClassEventable as any;
};

export const extendEventable = (target?: any): any => {
  invariant(!!target, 'extendEventable: Exepected non-null target');

  target._emitter = new EventEmitter();
  target.on = on;
  target.once = once;
  target.emit = emit;

  return target;
};
