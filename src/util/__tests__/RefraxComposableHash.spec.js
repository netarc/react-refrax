/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const RefraxComposableHash = require('RefraxComposableHash');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxComposableHash', () => {
  describe('instantiation', () => {
    it('should throw an error on invalid params', () => {
      expect(() => {
        new RefraxComposableHash(123);
      }).to.throw(Error, 'expected argument of type `Object`');

      expect(() => {
        new RefraxComposableHash('bar');
      }).to.throw(Error, 'expected argument of type `Object`');

      expect(() => {
        new RefraxComposableHash({}, 123);
      }).to.throw(Error, 'expected argument of type `Object`');

      expect(() => {
        new RefraxComposableHash({}, 'bar');
      }).to.throw(Error, 'expected argument of type `Object`');
    });

    it('should accept no arguments', () => {
      var hash = new RefraxComposableHash();

      expect(hash)
        .that.is.an.instanceof(RefraxComposableHash)
        .to.deep.equal({});

      expect(hash)
        .to.have.property('__hooks')
        .that.deep.equals([]);
    });

    it('should accept correct arguments', () => {
      var fn = () => { return {}; }
        , hash = new RefraxComposableHash({ 'foo': 'bar' }, { 'baz': 123 }, fn);

      expect(hash)
        .that.is.an.instanceof(RefraxComposableHash)
        .to.deep.equal({
          'foo': 'bar',
          'baz': 123
        });

      expect(hash)
        .to.have.property('__hooks')
        .that.deep.equals([fn]);
    });

    it('should accept another RefraxComposableHash instance', () => {
      var fn = () => { return {}; }
        , hash = new RefraxComposableHash(new RefraxComposableHash({ 'foo': 'bar' }, fn));

      expect(hash)
        .that.is.an.instanceof(RefraxComposableHash)
        .to.deep.equal({
          'foo': 'bar'
        });

      expect(hash)
        .to.have.property('__hooks')
        .that.deep.equals([fn]);
    });
  });

  describe('methods', () => {
    let hash = null;

    beforeEach(() => {
      hash = new RefraxComposableHash();
    });

    describe('extend', () => {
      it('should throw an error on invalid params', () => {
        expect(() => {
          hash.extend(123);
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.extend('bar');
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.extend({}, 123);
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.extend({}, 'bar');
        }).to.throw(Error, 'expected argument of type `Object`');
      });

      it('should accept no arguments', () => {
        hash.extend();

        expect(hash).to.deep.equal({});
        expect(hash.__hooks).to.deep.equal([]);
      });

      it('should accept correct arguments', () => {
        var fn = () => { return {}; };

        hash.extend({ 'foo': 'bar' }, { 'baz': 123 }, fn);

        expect(hash).to.deep.equal({
          'foo': 'bar',
          'baz': 123
        });
        expect(hash.__hooks).to.deep.equal([fn]);
      });

      it('should accept another RefraxComposableHash instance', () => {
        var fn = () => { return {}; };

        hash.extend(new RefraxComposableHash({ 'foo': 'bar' }, fn));

        expect(hash).to.deep.equal({
          'foo': 'bar'
        });
        expect(hash.__hooks).to.deep.equal([fn]);
      });

      it('should return itself', () => {
        var result = hash.extend();

        expect(result).to.equal(hash);
      });
    });

    describe('hook', () => {
      it('should throw an error on invalid params', () => {
        expect(() => {
          hash.hook(123);
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.hook('bar');
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.hook(() => {}, 123);
        }).to.throw(Error, 'expected argument of type `Object`');

        expect(() => {
          hash.hook(() => {}, 'bar');
        }).to.throw(Error, 'expected argument of type `Object`');
      });

      it('should accept correct arguments', () => {
        var fn = () => { return {}; }
          , fn2 = () => { return {}; };

        hash.hook(fn, fn2);

        expect(hash).to.deep.equal({});
        expect(hash.__hooks).to.deep.equal([fn, fn2]);
      });

      it('should return itself', () => {
        var result = hash.hook(() => { return {}; });

        expect(result).to.equal(hash);
      });
    });

    describe('compose', () => {
      it('should pass invoker to hooks', () => {
        var fn = sinon.spy(function() { return { bar: this.baz + 1 }; })
          , invoker = { baz: 1 };

        hash.extend({foo: 123});
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
        var fn = (_, i) => { return { bar: i.baz + 1 }; }
          , invoker = { baz: 1 };

        hash.extend({foo: 123});
        hash.hook(fn);

        expect(hash.compose(invoker)).to.deep.equal({
          bar: 2,
          foo: 123
        });
      });

      it('should handle multiple hooks', () => {
        var fn1 = (i, self) => { return { bar: self.baz + 1 }; }
          , fn2 = (i, self) => { return { bar: i.bar * 2, zap: 'abc' }; }
          , invoker = { baz: 1 };

        hash.extend({foo: 123});
        hash.hook(fn1);
        hash.hook(fn2);

        expect(hash.compose(invoker)).to.deep.equal({
          bar: 4,
          foo: 123,
          zap: 'abc'
        });
      });
    });
  });
});
