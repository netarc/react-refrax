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
      let mutable;
      const emit_1 = {
        type: 'attribute',
        target: 'foo',
        value: 111
      };
      const emit_2 = {
        type: 'attribute',
        target: 'baz',
        value: 222
      };
      const expected_state = RefraxTools.extend({}, mutableState, {
        foo: 111,
        baz: 222
      });
      const expected_data = RefraxTools.extend({}, mutableDefaultState, mutableState, {
        foo: 111,
        baz: 222
      });

      beforeEach(function() {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      describe('when passed an invalid attribute', function() {
        it('should throw an error', function() {
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
        it('will correctly update state', function() {
          mutable.set('foo', 111);
          mutable.set('zab');

          expect(mutable._state)
            .to.deep.equal(RefraxTools.extend({}, mutableState, {
              foo: 111,
              zab: null
            }));
          expect(mutable.data)
            .to.deep.equal(RefraxTools.extend({}, mutableDefaultState, mutableState, {
              foo: 111,
              zab: null
            }));
        });

        it('should emit', function() {
          mutable.set('foo', 111);
          mutable.set('zab');

          expect(mutable.emit.callCount).to.equal(2);
          expect(mutable.emit.getCall(0).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(0).args[1])
            .to.deep.equal({
              type: 'attribute',
              target: 'foo',
              value: 111
            });
          expect(mutable.emit.getCall(1).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(1).args[1])
            .to.deep.equal({
              type: 'attribute',
              target: 'zab',
              value: null
            });
        });
      });

      describe('when passed a key value object', function() {
        beforeEach(function() {
          mutable.set({
            'foo': 111,
            'baz': 222
          });
        });

        it('will correctly update state', function() {
          expect(mutable._state)
            .to.deep.equal(expected_state);
          expect(mutable.data)
            .to.deep.equal(expected_data);
        });

        it('should emit', function() {
          expect(mutable.emit.callCount).to.equal(2);
          expect(mutable.emit.getCall(0).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(0).args[1])
            .to.deep.equal(emit_1);
          expect(mutable.emit.getCall(1).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(1).args[1])
            .to.deep.equal(emit_2);
        });
      });

      describe('when passed the option', function() {
        describe('set', function() {
          describe('with key value object', function() {
            beforeEach(function() {
              mutable.set('foo', 111, { set: { 'baz': 222 }});
            });

            it('will correctly update state', function() {
              expect(mutable._state)
                .to.deep.equal(expected_state);
              expect(mutable.data)
                .to.deep.equal(expected_data);
            });

            it('should emit', function() {
              expect(mutable.emit.callCount).to.equal(2);
              expect(mutable.emit.getCall(0).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(0).args[1])
                .to.deep.equal(emit_1);
              expect(mutable.emit.getCall(1).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(1).args[1])
                .to.deep.equal(emit_2);
            });
          });

          describe('with key value object with function values', function() {
            beforeEach(function() {
              mutable.set('foo', 111, { set: { 'baz': () => { return 222; }}});
            });

            it('will correctly update state', function() {
              expect(mutable._state)
                .to.deep.equal(expected_state);
              expect(mutable.data)
                .to.deep.equal(expected_data);
            });

            it('should emit', function() {
              expect(mutable.emit.callCount).to.equal(2);
              expect(mutable.emit.getCall(0).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(0).args[1])
                .to.deep.equal(emit_1);
              expect(mutable.emit.getCall(1).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(1).args[1])
                .to.deep.equal(emit_2);
            });
          });
        });
      });
    });

    describe('setter', function() {
      let mutable;

      beforeEach(function() {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      describe('when passed an invalid attribute', function() {
        it('should throw an error', function() {
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
        it('will return a setter', function() {
          expect(mutable.setter('baz'))
            .to.be.a('function');
        });

        describe('will return a setter that', function() {
          it('correctly passes through to set', function() {
            var setter = mutable.setter('baz');

            sinon.spy(mutable, 'set');

            setter(111);

            expect(mutable.set.callCount).to.equal(1);
            expect(mutable.set.getCall(0).args)
              .to.deep.equal(['baz', 111,  {}]);
          });
        });

        describe('and a method', function() {
          it('will use method as a callback', function() {
            var hook = sinon.spy()
              , setter = mutable.setter('baz', hook);

            sinon.spy(mutable, 'set');

            setter(111);

            expect(hook.callCount).to.equal(1);
            expect(hook.getCall(0).args)
              .to.deep.equal([111, 'baz']);

            expect(mutable.set.callCount).to.equal(1);
            expect(mutable.set.getCall(0).args)
              .to.deep.equal(['baz', 111,  { onSet: hook }]);
          });
        });

        describe('and options', function() {
          it('will correctly use onSet callback', function() {
            var hook = sinon.spy()
              , setter = mutable.setter('baz', { onSet: hook });

            sinon.spy(mutable, 'set');

            setter(111);

            expect(hook.callCount).to.equal(1);
            expect(hook.getCall(0).args)
              .to.deep.equal([111, 'baz']);

            expect(mutable.set.callCount).to.equal(1);
            expect(mutable.set.getCall(0).args)
              .to.deep.equal(['baz', 111,  { onSet: hook }]);
          });
        });
      });
    });

    describe('unset', function() {
      let mutable;

      beforeEach(function() {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      it('should reset current state only', function() {
        mutable.unset();

        expect(mutable._state)
          .to.deep.equal({});
        expect(mutable.data)
          .to.deep.equal(mutableDefaultState);
      });

      it('should emit', function() {
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
      let mutable;

      beforeEach(function() {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      it('should return all errors with invalid attribute', function() {
        mutable.errors = mutableErrors;

        expect(mutable.getErrors())
          .to.deep.equal(mutableErrors);
        expect(mutable.getErrors(null))
          .to.deep.equal(mutableErrors);
      });

      it('should return specific error with a valid attribute', function() {
        mutable.errors = mutableErrors;

        expect(mutable.getErrors('foo'))
          .to.equal('foo error');
        expect(mutable.getErrors('baz'))
          .to.equal(undefined);
      });
    });
  });
});
