/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { invariant } from './tools';

export interface IDisposable {
  disposed: boolean;
  dispose(): void;
}

export class Disposable {
  protected _disposed: boolean;
  protected _disposeBlock: () => void;

  get disposed(): boolean {
    return this._disposed;
  }

  constructor(block: () => void) {
    invariant(typeof(block) === 'function', `RefraxDisposable: Expected function, but found \`${typeof(block)}\``);

    this._disposed = false;
    this._disposeBlock = block;
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }

    this._disposed = true;
    this._disposeBlock();
  }
}

export interface ICompoundDisposable extends IDisposable {
  addDisposable(disposable: Disposable): void;
}

export class CompoundDisposable extends Disposable implements ICompoundDisposable {
  protected _disposables: Disposable[];

  constructor() {
    super(() => {
      for (let i = 0, len = this._disposables.length; i < len; i++) {
        const disposer = this._disposables[i];

        if (!disposer.disposed) {
          disposer.dispose();
        }
      }
      this._disposables = [];
    });

    this._disposables = [];
  }

  addDisposable(disposable: Disposable) {
    invariant(disposable instanceof Disposable, 'RefraxDisposable: Expected Disposabletype');

    if (this._disposed) {
      disposable.dispose();
    }
    else {
      this._disposables.push(disposable);
    }
  }
}

export type CompoundDisposableConstructor<T> = new(...args: any[]) => T;

export function mixinCompoundDisposable<T extends CompoundDisposableConstructor<{}>>(Base: T):
    CompoundDisposableConstructor<ICompoundDisposable> & T {
  return class extends Base implements ICompoundDisposable {
    protected _disposable: CompoundDisposable;

    get disposed(): boolean {
      return this._disposable.disposed;
    }

    constructor(...args: any[]) {
      super(...args);

      this._disposable = new CompoundDisposable();
    }

    dispose(): void {
      this._disposable.dispose();
    }

    addDisposable(disposable: Disposable) {
      this._disposable.addDisposable(disposable);
    }
  };
}
