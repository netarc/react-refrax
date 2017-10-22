/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { spy } from 'sinon';

import { ComposableHash } from 'util/composableHash';
import { IKeyValue, TComposableHashHook } from 'util/types';

// tslint:disable no-magic-numbers align no-unused-expression no-empty

describe('ComposableHash', () => {
  describe('instantiation', () => {
    it('should throw an error on invalid params', () => {
      expect(() => {
        new ComposableHash(123 as any);
      }).to.throw(Error, 'expected argument of type \'Object\'');

      expect(() => {
        new ComposableHash('bar' as any);
      }).to.throw(Error, 'expected argument of type \'Object\'');

      expect(() => {
        new ComposableHash({}, 123 as any);
      }).to.throw(Error, 'expected argument of type \'Object\'');

      expect(() => {
        new ComposableHash({}, 'bar' as any);
      }).to.throw(Error, 'expected argument of type \'Object\'');
    });

    it('should accept no arguments', () => {
      const hash = new ComposableHash();

      expect(hash)
        .that.is.an.instanceof(ComposableHash)
        .to.deep.equal({});

      expect(hash)
        .to.have.property('_weakHooks')
        .that.deep.equals([]);
      expect(hash)
        .to.have.property('_hooks')
        .that.deep.equals([]);
    });

    it('should accept correct arguments', () => {
      const fn = (): IKeyValue => ({});
      const hash = new ComposableHash({ foo: 'bar' }, { baz: 123 }, fn);

      expect(hash)
        .that.is.an.instanceof(ComposableHash)
        .to.deep.equal({
          foo: 'bar',
          baz: 123
        });

      expect(hash)
        .to.have.property('_weakHooks')
        .that.deep.equals([]);
      expect(hash)
        .to.have.property('_hooks')
        .that.deep.equals([fn]);
    });

    it('should accept another ComposableHash instance', () => {
      const fn = (): IKeyValue => ({});
      const hash = new ComposableHash(new ComposableHash({ foo: 'bar' }, fn));

      expect(hash)
        .that.is.an.instanceof(ComposableHash)
        .to.deep.equal({
          foo: 'bar'
        });

      expect(hash)
        .to.have.property('_weakHooks')
        .that.deep.equals([]);
      expect(hash)
        .to.have.property('_hooks')
        .that.deep.equals([fn]);
    });
  });

  describe('methods', () => {
    let hash: ComposableHash;

    beforeEach(() => {
      hash = new ComposableHash();
    });

    describe('extend', () => {
      it('should throw an error on invalid params', () => {
        expect(() => {
          hash.extend(123 as any);
        }).to.throw(Error, 'expected argument of type \'Object\'');

        expect(() => {
          hash.extend('bar' as any);
        }).to.throw(Error, 'expected argument of type \'Object\'');

        expect(() => {
          hash.extend({}, 123 as any);
        }).to.throw(Error, 'expected argument of type \'Object\'');

        expect(() => {
          hash.extend({}, 'bar' as any);
        }).to.throw(Error, 'expected argument of type \'Object\'');
      });

      it('should accept no arguments', () => {
        hash.extend();

        expect(hash).to.deep.equal({});
        expect(hash._weakHooks).to.deep.equal([]);
        expect(hash._hooks).to.deep.equal([]);
      });

      it('should accept correct arguments', () => {
        const fn = (): IKeyValue => ({});

        hash.extend({ foo: 'bar' }, { baz: 123 }, fn);

        expect(hash).to.deep.equal({
          foo: 'bar',
          baz: 123
        });
        expect(hash._weakHooks).to.deep.equal([]);
        expect(hash._hooks).to.deep.equal([fn]);
      });

      it('should accept another ComposableHash instance', () => {
        const fn = (): IKeyValue => ({});

        hash.extend(new ComposableHash({ foo: 'bar' }, fn));

        expect(hash).to.deep.equal({
          foo: 'bar'
        });
        expect(hash._weakHooks).to.deep.equal([]);
        expect(hash._hooks).to.deep.equal([fn]);
      });

      it('should accept another lazy ComposableHash instance', () => {
        const fn = (): IKeyValue => ({});

        hash.extend({ foo: 'baz' });
        hash.extend(new ComposableHash({ foo: 'bar' }, fn).weakify());

        expect(hash).to.deep.equal({
          foo: 'baz'
        });
        expect(hash._weakHooks).to.deep.equal([fn]);
        expect(hash._hooks).to.deep.equal([]);
      });

      it('should return itself', () => {
        const result = hash.extend();

        expect(result).to.equal(hash);
      });
    });

    describe('hook', () => {
      it('should throw an error on invalid params', () => {
        expect(() => {
          hash.hook(123 as any);
        }).to.throw(Error, 'expected argument of type \'Function\'');

        expect(() => {
          hash.hook('bar' as any);
        }).to.throw(Error, 'expected argument of type \'Function\'');

        expect(() => {
          hash.hook(() => {}, 123 as any);
        }).to.throw(Error, 'expected argument of type \'Function\'');

        expect(() => {
          hash.hook(() => {}, 'bar' as any);
        }).to.throw(Error, 'expected argument of type \'Function\'');
      });

      it('should accept correct arguments', () => {
        const fn = (): IKeyValue => ({});
        const fn2 = (): IKeyValue => ({});

        hash.hook(fn, fn2);

        expect(hash).to.deep.equal({});
        expect(hash._weakHooks).to.deep.equal([]);
        expect(hash._hooks).to.deep.equal([fn, fn2]);
      });

      it('should return itself', () => {
        const result = hash.hook((): IKeyValue => ({}));

        expect(result).to.equal(hash);
      });
    });

    describe('compose', () => {
      it('should pass invoker to hooks', () => {
        const fn = spy(function(this: any): IKeyValue { return { bar: this.baz + 1 }; });
        const invoker = { baz: 1 };

        hash.extend({ foo: 123 });
        hash.hook(fn);

        const result = hash.compose(invoker);

        expect(result).to.deep.equal({
          bar: 2,
          foo: 123
        });
        expect(fn.callCount).to.equal(1);
        expect(fn.thisValues[0]).to.equal(invoker);
        expect(fn.getCall(0).args[0]).to.equal(result);
        expect(fn.getCall(0).args[1]).to.equal(invoker);
      });

      it('should return valid result', () => {
        const fn = (_result: IKeyValue, i: {[key: string]: any}): IKeyValue => ({ bar: i.baz + 1 });
        const invoker = { baz: 1 };

        hash.extend({ foo: 123 });
        hash.hook(fn);

        expect(hash.compose(invoker)).to.deep.equal({
          bar: 2,
          foo: 123
        });
      });

      it('should handle multiple hooks', () => {
        const fn1: TComposableHashHook =
          (_result: IKeyValue, self: any): IKeyValue => ({ bar: self.baz + 1 });
        const fn2: TComposableHashHook =
          (result: IKeyValue, _self: any): IKeyValue => ({ bar: result.bar * 2, zap: 'abc' });
        const invoker = { baz: 1 };

        hash.extend({ foo: 123 });
        hash.hook(fn1);
        hash.hook(fn2);

        expect(hash.compose(invoker)).to.deep.equal({
          bar: 4,
          foo: 123,
          zap: 'abc'
        });
      });

      it('should correctly handle lazy hashes', () => {
        const fn1: TComposableHashHook =
        (_result: IKeyValue, self: any): IKeyValue => ({ bar: self.baz + 1 });
        const fn2: TComposableHashHook =
          (result: IKeyValue, _self: any): IKeyValue => ({ bar: result.bar * 2, zap: 'abc' });
        const fn3: TComposableHashHook =
          (_result: IKeyValue, _self: any): IKeyValue => ({ foo: 888 });
        const invoker = { baz: 1 };

        hash.extend({ foo: 123 });
        hash.hook(fn1);
        hash.hook(fn2);
        hash.extend(new ComposableHash({
          bar: 999
        }, fn3).weakify());

        expect(hash.compose(invoker)).to.deep.equal({
          bar: 4,
          foo: 123,
          zap: 'abc'
        });
      });
    });
  });
});
