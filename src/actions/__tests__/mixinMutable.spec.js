/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const mixinMutable = require('mixinMutable');
const RefraxTools = require('RefraxTools');
const expect = chai.expect;


const mutableState = {
  foo: 123,
  bar: 'baz'
};

const mutableDefaultState = {
  foo: 'wut',
  zoo: 321
};

const mutableErrors = {
  foo: 'foo error'
};

function createMutable(data, defaultState) {
  var mutable = mixinMutable({
    emit: sinon.spy()
  });

  if (defaultState) {
    mutable.getDefault = function() {
      return defaultState;
    };
  }

  RefraxTools.extend(mutable._state, data);
  return mutable;
}

describe('mixinMutable', function() {
  describe('when invoked', function() {
    it('should not accept an empty target', function() {
      expect(function() {
        mixinMutable();
      }).to.throw(TypeError, 'exepected non-null target');
    });

    it('should look like mixinMutable', function() {
      var mutable = createMutable();

      expect(Object.getOwnPropertyDescriptor(mutable, 'data').get)
        .to.be.a('function');
      expect(mutable).to.have.property('_state')
        .to.be.a('object');
      expect(mutable).to.have.property('errors')
        .to.be.a('object');
    });
  });

  describe('methods', function() {
    describe('get', function() {
      describe('when passed an invalid attribute', function() {
        it('should throw an error', function() {
          var mutable = createMutable(mutableState);

          expect(function() {
            expect(mutable.get())
              .to.equal(null);
          }).to.throw(TypeError, 'get expected attribute name');

          expect(function() {
            expect(mutable.get(123))
              .to.equal(null);
          }).to.throw(TypeError, 'get expected attribute name');

          expect(function() {
            expect(mutable.get(function() {}))
              .to.equal(null);
          }).to.throw(TypeError, 'get expected attribute name');
        });
      });

      describe('when passed an attribute', function() {
        describe('that doesnt exist', function() {
          it('should return undefined', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('baz'))
              .to.equal(undefined);
          });
        });

        describe('that exists', function() {
          it('should return correct value', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('foo'))
              .to.equal(123);
            expect(mutable.get('zoo'))
              .to.equal(321);
          });
        });
      });
    });

    describe('set', function() {
      describe('when passed an invalid attribute', function() {
        it('should throw an error', function() {
          var mutable = createMutable(mutableState);

          expect(function() {
            expect(mutable.set())
              .to.equal(null);
          }).to.throw(TypeError, 'set expected attribute name');

          expect(function() {
            expect(mutable.set(123))
              .to.equal(null);
          }).to.throw(TypeError, 'set expected attribute name');

          expect(function() {
            expect(mutable.set(function() {}))
              .to.equal(null);
          }).to.throw(TypeError, 'set expected attribute name');
        });
      });

      describe('when passed an attribute', function() {
        describe('that doesnt exist', function() {
          it('should set value in current state', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            mutable.set('baz', 111);

            expect(mutable._state)
              .to.deep.equal(RefraxTools.extend({}, mutableState, {
                baz: 111
              }));
            expect(mutable.data)
              .to.deep.equal(RefraxTools.extend({}, mutableDefaultState, mutableState, {
                baz: 111
              }));
          });

          it('should emit', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            mutable.set('baz', 111);

            expect(mutable.emit.callCount).to.equal(1);
            expect(mutable.emit.getCall(0).args[0])
              .to.equal('mutated');
            expect(mutable.emit.getCall(0).args[1])
              .to.deep.equal({
                type: 'attribute',
                target: 'baz',
                value: 111
              });
          });
        });

        describe('that exists', function() {
          it('should overide value in current state', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            mutable.set('foo', 111);

            expect(mutable._state)
              .to.deep.equal(RefraxTools.extend({}, mutableState, {
                foo: 111
              }));
            expect(mutable.data)
              .to.deep.equal(RefraxTools.extend({}, mutableDefaultState, mutableState, {
                foo: 111
              }));
          });

          it('should emit', function() {
            var mutable = createMutable(mutableState, mutableDefaultState);

            mutable.set('foo', 111);

            expect(mutable.emit.callCount).to.equal(1);
            expect(mutable.emit.getCall(0).args[0])
              .to.equal('mutated');
            expect(mutable.emit.getCall(0).args[1])
              .to.deep.equal({
                type: 'attribute',
                target: 'foo',
                value: 111
              });
          });
        });
      });
    });

    describe('setter', function() {
      describe('when passed an invalid attribute', function() {
        it('should throw an error', function() {
          var mutable = createMutable(mutableState);

          expect(function() {
            expect(mutable.setter())
              .to.equal(null);
          }).to.throw(TypeError, 'setter expected attribute name');

          expect(function() {
            expect(mutable.setter(123))
              .to.equal(null);
          }).to.throw(TypeError, 'setter expected attribute name');

          expect(function() {
            expect(mutable.setter(function() {}))
              .to.equal(null);
          }).to.throw(TypeError, 'setter expected attribute name');
        });
      });

      describe('when passed an attribute', function() {
        describe('will return a setter', function() {
          it('that correctly sets state', function() {
            var mutable = createMutable(mutableState, mutableDefaultState)
              , setter = mutable.setter('baz');

            expect(setter)
              .to.be.a('function');

            setter(111);

            expect(mutable._state)
              .to.deep.equal(RefraxTools.extend({}, mutableState, {
                baz: 111
              }));
            expect(mutable.data)
              .to.deep.equal(RefraxTools.extend({}, mutableDefaultState, mutableState, {
                baz: 111
              }));
          });

          it('that emits', function() {
            var mutable = createMutable(mutableState, mutableDefaultState)
              , setter = mutable.setter('baz');

            expect(setter)
              .to.be.a('function');

            setter(111);

            expect(mutable.emit.callCount).to.equal(1);
            expect(mutable.emit.getCall(0).args[0])
              .to.equal('mutated');
            expect(mutable.emit.getCall(0).args[1])
              .to.deep.equal({
                type: 'attribute',
                target: 'baz',
                value: 111
              });

          });
        });
      });
    });

    describe('unset', function() {
      it('should reset current state only', function() {
        var mutable = createMutable(mutableState, mutableDefaultState);

        mutable.unset();

        expect(mutable._state)
          .to.deep.equal({});
        expect(mutable.data)
          .to.deep.equal(mutableDefaultState);
      });

      it('should emit', function() {
        var mutable = createMutable(mutableState, mutableDefaultState);

        mutable.unset();

        expect(mutable.emit.callCount).to.equal(1);
        expect(mutable.emit.getCall(0).args[0])
          .to.equal('mutated');
        expect(mutable.emit.getCall(0).args[1])
          .to.deep.equal({
            type: 'attribute',
            target: null,
            value: null
          });
      });
    });

    describe('getErrors', function() {
      it('should return all errors with invalid attribute', function() {
        var mutable = createMutable(mutableState, mutableDefaultState);

        mutable.errors = mutableErrors;

        expect(mutable.getErrors())
          .to.deep.equal(mutableErrors);
        expect(mutable.getErrors(null))
          .to.deep.equal(mutableErrors);
      });

      it('should return specific error with a valid attribute', function() {
        var mutable = createMutable(mutableState, mutableDefaultState);

        mutable.errors = mutableErrors;

        expect(mutable.getErrors('foo'))
          .to.equal('foo error');
        expect(mutable.getErrors('baz'))
          .to.equal(undefined);
      });
    });
  });
});
