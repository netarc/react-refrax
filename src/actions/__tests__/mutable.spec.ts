/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import { extendMutable, IMutable } from '../../actions/mutable';
import { Eventable } from '../../util/eventable';
import { extend } from '../../util/tools';
import { IKeyValue } from '../../util/types';

// tslint:disable no-magic-numbers no-empty

const mutableState = {
  foo: 123,
  bar: 'baz',
  zap: {
    foo: 321
  }
};

const mutableDefaultState = {
  foo: 'wut',
  zoo: 321
};

const mutableErrors = {
  foo: 'foo error',
  zap: {
    foo: 'zap.foo error'
  }
};

interface ITestableMutable extends IMutable, Eventable {
  emit: SinonSpy;
}

const createMutable = (data?: IKeyValue, defaultState?: IKeyValue): ITestableMutable => {
  const mutable = extendMutable({
    emit: spy()
  });

  if (defaultState) {
    mutable.getDefault = (): IKeyValue => defaultState;
  }

  extend(mutable._state, data);

  return mutable as any;
};

describe('extendMutable', () => {
  describe('when invoked', () => {
    it('should not accept an empty target', () => {
      expect(() => {
        // @ts-ignore
        extendMutable();
      }).to.throw(Error, 'Exepected non-null target');
    });

    it('should look like extendMutable', () => {
      const mutable = createMutable();

      expect(Object.getOwnPropertyDescriptor(mutable, 'data')!.get)
        .to.be.a('function');
      expect(mutable).to.have.property('_state')
        .to.be.a('object');
      expect(mutable).to.have.property('_errors')
        .to.be.a('object');
    });
  });

  describe('methods', () => {
    describe('get', () => {
      describe('when passed an invalid attribute', () => {
        it('should throw an error', () => {
          const mutable = createMutable(mutableState);

          expect(() => {
            // @ts-ignore
            expect(mutable.get())
              .to.equal(null);
          }).to.throw(Error, 'get expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.get(123))
              .to.equal(null);
          }).to.throw(Error, 'get expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.get(() => {}))
              .to.equal(null);
          }).to.throw(Error, 'get expected attribute name');
        });
      });

      describe('when passed an attribute', () => {
        describe('that doesnt exist', () => {
          it('should return undefined', () => {
            const mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('baz'))
              .to.equal(undefined);
          });
        });

        describe('that exists', () => {
          it('should return correct value', () => {
            const mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('foo'))
              .to.equal(123);
            expect(mutable.get('zoo'))
              .to.equal(321);
          });
        });
      });

      describe('when passed a deep attribute', () => {
        describe('that doesnt exist', () => {
          it('should return undefined', () => {
            const mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('zap.fooz'))
              .to.equal(undefined);
          });
        });

        describe('that exists', () => {
          it('should return correct value', () => {
            const mutable = createMutable(mutableState, mutableDefaultState);

            expect(mutable.get('zap.foo'))
              .to.equal(321);
          });
        });
      });

      describe('when passed the option', () => {
        describe('shallow', () => {
          describe('when passed a deep attribute', () => {
            describe('that doesnt exist', () => {
              it('should return undefined', () => {
                const mutable = createMutable(mutableState, mutableDefaultState);

                expect(mutable.get('zap.fooz', { shallow: true }))
                  .to.equal(undefined);
              });
            });

            describe('that exists', () => {
              it('should return correct value', () => {
                const mutable = createMutable(mutableState, mutableDefaultState);

                expect(mutable.get('zap.foo', { shallow: true }))
                  .to.equal(undefined);
              });
            });
          });
        });
      });
    });

    describe('set', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      describe('when passed an invalid attribute', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            expect(mutable.set())
              .to.equal(null);
          }).to.throw(Error, 'set expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.set(123))
              .to.equal(null);
          }).to.throw(Error, 'set expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.set(() => {}))
              .to.equal(null);
          }).to.throw(Error, 'set expected attribute name');
        });
      });

      describe('when passed an attribute', () => {
        it('will correctly update state', () => {
          mutable.set('foo', 111);
          mutable.set('zab');

          expect(mutable._state)
            .to.deep.equal(extend({}, mutableState, {
              foo: 111,
              zab: undefined
            }));
          expect(mutable.data)
            .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
              foo: 111,
              zab: undefined
            }));
        });

        it('should emit', () => {
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
              value: undefined
            });
        });
      });

      describe('when passed a deep attribute', () => {
        it('will correctly update state', () => {
          mutable.set('nested.foo', 111);
          mutable.set('nested.fooz.bar', 321);
          mutable.set('nested.zab');

          expect(mutable._state)
            .to.deep.equal(extend({}, mutableState, {
              nested: {
                foo: 111,
                fooz: {
                  bar: 321
                },
                zab: undefined
              }
            }));
          expect(mutable.data)
            .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
              nested: {
                foo: 111,
                fooz: {
                  bar: 321
                },
                zab: undefined
              }
            }));
        });

        it('should emit', () => {
          mutable.set('nested.foo', 111);
          mutable.set('nested.zab');

          expect(mutable.emit.callCount).to.equal(2);
          expect(mutable.emit.getCall(0).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(0).args[1])
            .to.deep.equal({
              type: 'attribute',
              target: 'nested.foo',
              value: 111
            });
          expect(mutable.emit.getCall(1).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(1).args[1])
            .to.deep.equal({
              type: 'attribute',
              target: 'nested.zab',
              value: undefined
            });
        });

        it('should error when attempting to set non object', () => {
          expect(() => {
            mutable.set('foo.bar', 111);
          }).to.throw(Error, 'set expected deep attribute `foo` to be an object');

          expect(() => {
            mutable.set('nested.foo', 111);
            mutable.set('nested.foo.bar', 111);
          }).to.throw(Error, 'set expected deep attribute `nested.foo` to be an object');
        });
      });

      describe('when passed a key value object', () => {
        beforeEach(() => {
          mutable.set({
            foo: 111,
            baz: 222
          });
        });

        it('will correctly update state', () => {
          expect(mutable._state)
            .to.deep.equal(extend({}, mutableState, {
              foo: 111,
              baz: 222
            }));
          expect(mutable.data)
            .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
              foo: 111,
              baz: 222
            }));
        });

        it('should emit', () => {
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
              target: 'baz',
              value: 222
            });
        });
      });

      describe('when passed the option', () => {
        describe('shallow', () => {
          describe('when passed a deep attribute', () => {
            it('will correctly update state', () => {
              mutable.set('nested.foo', 111, { shallow: true });
              mutable.set('nested.fooz.bar', 321, { shallow: true });
              mutable.set('nested.zab', undefined, { shallow: true });

              expect(mutable._state)
                .to.deep.equal(extend({}, mutableState, {
                  'nested.foo': 111,
                  'nested.fooz.bar': 321,
                  'nested.zab': undefined
                }));
              expect(mutable.data)
                .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
                  'nested.foo': 111,
                  'nested.fooz.bar': 321,
                  'nested.zab': undefined
                }));
            });

            it('should emit', () => {
              mutable.set('nested.foo', 111, { shallow: true });
              mutable.set('nested.zab', undefined, { shallow: true });

              expect(mutable.emit.callCount).to.equal(2);
              expect(mutable.emit.getCall(0).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(0).args[1])
                .to.deep.equal({
                  type: 'attribute',
                  target: 'nested.foo',
                  value: 111
                });
              expect(mutable.emit.getCall(1).args[0])
                .to.equal('mutated');
              expect(mutable.emit.getCall(1).args[1])
                .to.deep.equal({
                  type: 'attribute',
                  target: 'nested.zab',
                  value: undefined
                });
            });

            it('should not error when attempting to set non objects', () => {
              expect(() => {
                mutable.set('foo.bar', 111, { shallow: true });
              }).to.not.throw(Error);

              expect(() => {
                mutable.set('nested.foo', 111, { shallow: true });
                mutable.set('nested.foo.bar', 111, { shallow: true });
              }).to.not.throw(Error);
            });
          });
        });

        describe('set', () => {
          describe('with key value object', () => {
            beforeEach(() => {
              mutable.set('foo', 111, { set: { baz: 222 } });
            });

            it('will correctly update state', () => {
              expect(mutable._state)
                .to.deep.equal(extend({}, mutableState, {
                  foo: 111,
                  baz: 222
                }));
              expect(mutable.data)
                .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
                  foo: 111,
                  baz: 222
                }));
            });

            it('should emit', () => {
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
                  target: 'baz',
                  value: 222
                });
            });
          });

          describe('with key value object with function values', () => {
            beforeEach(() => {
              mutable.set('foo', 111, { set: { baz: (): number => 222 } });
            });

            it('will correctly update state', () => {
              expect(mutable._state)
                .to.deep.equal(extend({}, mutableState, {
                  foo: 111,
                  baz: 222
                }));
              expect(mutable.data)
                .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
                  foo: 111,
                  baz: 222
                }));
            });

            it('should emit', () => {
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
                  target: 'baz',
                  value: 222
                });
            });
          });

          describe('with deep key value object', () => {
            beforeEach(() => {
              mutable.set('foo', 111, { set: { 'baz.bar': 222 } });
            });

            it('will correctly update state', () => {
              expect(mutable._state)
                .to.deep.equal(extend({}, mutableState, {
                  foo: 111,
                  baz: {
                    bar: 222
                  }
                }));
              expect(mutable.data)
                .to.deep.equal(extend({}, mutableDefaultState, mutableState, {
                  foo: 111,
                  baz: {
                    bar: 222
                  }
                }));
            });

            it('should emit', () => {
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
                  target: 'baz.bar',
                  value: 222
                });
            });
          });
        });
      });
    });

    describe('setter', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      describe('when passed an invalid attribute', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            expect(mutable.setter())
              .to.equal(null);
          }).to.throw(Error, 'setter expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.setter(123))
              .to.equal(null);
          }).to.throw(Error, 'setter expected attribute name');

          expect(() => {
            // @ts-ignore
            expect(mutable.setter(() => {}))
              .to.equal(null);
          }).to.throw(Error, 'setter expected attribute name');
        });
      });

      describe('when passed an attribute', () => {
        it('will return a setter', () => {
          expect(mutable.setter('baz'))
            .to.be.a('function');
        });

        describe('will return a setter that', () => {
          it('correctly passes through to set', () => {
            const setter = mutable.setter('baz');
            const spySet = spy(mutable, 'set');

            setter(111);

            expect(spySet.callCount).to.equal(1);
            expect(spySet.getCall(0).args)
              .to.deep.equal(['baz', 111,  {}]);
          });
        });

        describe('and a method', () => {
          it('will use method as a callback', () => {
            const hook = spy();
            const setter = mutable.setter('baz', hook);
            const spySet = spy(mutable, 'set');

            setter(111);

            expect(hook.callCount).to.equal(1);
            expect(hook.getCall(0).args)
              .to.deep.equal([111, 'baz']);

            expect(spySet.callCount).to.equal(1);
            expect(spySet.getCall(0).args)
              .to.deep.equal(['baz', 111,  { onSet: hook }]);
          });
        });

        describe('and options', () => {
          it('will correctly use onSet callback', () => {
            const hook = spy();
            const setter = mutable.setter('baz', { onSet: hook });
            const spySet = spy(mutable, 'set');

            setter(111);

            expect(hook.callCount).to.equal(1);
            expect(hook.getCall(0).args)
              .to.deep.equal([111, 'baz']);

            expect(spySet.callCount).to.equal(1);
            expect(spySet.getCall(0).args)
              .to.deep.equal(['baz', 111,  { onSet: hook }]);
          });
        });
      });
    });

    describe('unset', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      it('should reset current state only', () => {
        mutable.unset();

        expect(mutable._state)
          .to.deep.equal({});
        expect(mutable.data)
          .to.deep.equal(mutableDefaultState);
      });

      it('should emit', () => {
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

    describe('getErrors', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      it('should return all errors with invalid attribute', () => {
        mutable.setErrors(mutableErrors);

        expect(mutable.getErrors())
          .to.deep.equal(mutableErrors);
        expect(mutable.getErrors(null))
          .to.deep.equal(mutableErrors);
      });

      it('should return specific error with a valid attribute', () => {
        mutable.setErrors(mutableErrors);

        expect(mutable.getErrors('foo'))
          .to.equal('foo error');
        expect(mutable.getErrors('baz'))
          .to.equal(undefined);
        expect(mutable.getErrors('zap.foo'))
          .to.equal('zap.foo error');
        expect(mutable.getErrors('foo.foo'))
          .to.equal(undefined);
      });
    });

    describe('setErrors', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
      });

      describe('when passed an invalid attribute', () => {
        it('should throw an error', () => {
          expect(() => {
            // @ts-ignore
            expect(mutable.setErrors());
          }).to.not.throw(Error, 'setErrors expected errors object');

          expect(() => {
            // @ts-ignore
            expect(mutable.setErrors(123));
          }).to.throw(Error, 'setErrors expected errors object');

          expect(() => {
            // @ts-ignore
            expect(mutable.setErrors(() => {}));
          }).to.throw(Error, 'setErrors expected errors object');
        });
      });

      describe('when passed an object', () => {
        it('will correctly update state', () => {
          mutable.setErrors(mutableErrors);

          expect(mutable.getErrors())
            .to.deep.equal(mutableErrors);
          expect(mutable.getErrors(null))
            .to.deep.equal(mutableErrors);
        });

        it('should emit', () => {
          mutable.setErrors(mutableErrors);

          expect(mutable.emit.callCount).to.equal(1);
          expect(mutable.emit.getCall(0).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(0).args[1])
            .to.deep.equal({
              type: 'errors',
              errors: mutableErrors
            });
        });
      });
    });

    describe('unsetErrors', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable(mutableState, mutableDefaultState);
        mutable.setErrors(mutableErrors);
        mutable.emit.reset();
      });

      describe('when invoked', () => {
        it('will correctly update state', () => {
          mutable.unsetErrors();

          expect(mutable.getErrors())
            .to.deep.equal({});
          expect(mutable.getErrors(null))
            .to.deep.equal({});
        });

        it('should emit', () => {
          mutable.unsetErrors();

          expect(mutable.emit.callCount).to.equal(1);
          expect(mutable.emit.getCall(0).args[0])
            .to.equal('mutated');
          expect(mutable.emit.getCall(0).args[1])
            .to.deep.equal({
              type: 'errors',
              errors: null
            });
        });
      });
    });

    describe('isMutated', () => {
      let mutable: ITestableMutable;

      beforeEach(() => {
        mutable = createMutable({}, mutableDefaultState);
      });

      describe('when invoked', () => {
        it('will correctly update state', () => {
          expect(mutable.isMutated())
            .to.equal(false);

          mutable.set('foo', 123);

          expect(mutable.isMutated())
            .to.equal(true);

          mutable.unset();

          expect(mutable.isMutated())
            .to.equal(false);
        });
      });
    });
  });
});
