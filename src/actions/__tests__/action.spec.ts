/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';
import { expect } from 'chai';
import { spy } from 'sinon';

import { createAction, IAction } from '../../actions/action';
import { ActionEntity } from '../../actions/entity';
import { RequestError } from '../../util/requestError';
import { getPrototypeOf } from '../../util/tools';
import { IKeyValue } from '../../util/types';

// tslint:disable no-magic-numbers align no-unused-expression

describe('createAction', () => {
  describe('when invoked', () => {
    it('should not accept invalid arguments', () => {
      expect(() => {
        // @ts-ignore
        createAction();
      }).to.throw(Error, 'Expected function, but found');

      expect(() => {
        // @ts-ignore
        createAction(123);
      }).to.throw(Error, 'Expected function, but found');

      expect(() => {
        // @ts-ignore
        createAction({ foo: 123 });
      }).to.throw(Error, 'Expected function, but found');

      expect(() => {
        // @ts-ignore
        createAction('foo');
      }).to.throw(Error, 'Expected function, but found');
    });

    it('should return a Action wrapper', () => {
      // tslint:disable-next-line:no-empty
      const action = createAction(() => {});

      expect(action).to.be.a('function');
      expect(action.toString()).to.equal('RefraxAction(1) => function () {}');
      expect(action)
        .to.have.property('_entity')
        .that.is.an.instanceof(ActionEntity);
      expect(action)
        .to.have.property('_stack')
        .that.is.a('array');

      // extendConfigurable
      expect(action).itself
        .to.respondTo('withOptions')
        .to.respondTo('withParams')
        .to.respondTo('withQueryParams');

      // MixinStatus
      expect(action).itself
        .to.respondTo('isPending')
        .to.respondTo('isLoading')
        .to.respondTo('hasData')
        .to.respondTo('isStale');

      // Prototypes to ActionEntity
      expect(action).itself
        .to.respondTo('invoke');

      // Prototypes to ActionEntity:mixinEventable
      expect(action).itself
        .to.respondTo('on')
        .to.respondTo('once')
        .to.respondTo('emit');

      // Prototypes to ActionEntity:mixinMutable
      expect(action).itself
        .to.respondTo('get')
        .to.respondTo('set')
        .to.respondTo('setter')
        .to.respondTo('unset')
        .to.respondTo('getErrors');
    });
  });

  describe('Action Wrapper', () => {
    describe('when invoked', () => {
      it('returns a promise', () => {
        const method = spy();
        const action = createAction(method);

        expect(action()).to.be.instanceof(Promise);
      });

      it('invokes wrapped method and emits', () => {
        const method = spy();
        const action = createAction(method);

        const spyInvoke = spy(action._entity, 'invoke');
        const spyEmit = spy(action._entity, 'emit');

        return action()
          .then(() => {
            expect(spyInvoke.callCount).to.equal(1);
            expect(method.callCount).to.equal(1);

            expect(spyEmit.callCount).to.equal(4);
            expect(spyEmit.getCall(0).args[0]).to.equal('mutated');
            expect(spyEmit.getCall(0).args[1]).to.deep.equal({
              type: 'errors',
              errors: {}
            });
            expect(spyEmit.getCall(1).args[0]).to.equal('start');
            expect(getPrototypeOf(spyEmit.getCall(1).args[1]).constructor.name).to.equal('ActionInvoker');
            expect(spyEmit.getCall(2).args[0]).to.equal('mutated');
            expect(spyEmit.getCall(2).args[1]).to.deep.equal({
              type: 'attribute',
              target: null,
              value: null
            });
            expect(spyEmit.getCall(3).args[0]).to.equal('finish');
            expect(getPrototypeOf(spyEmit.getCall(3).args[1]).constructor.name).to.equal('ActionInvoker');
          });
      });

      it('resets errors', () => {
        const method = spy();
        const action = createAction(method);
        let errors: IKeyValue;

        action.setErrors({ foo: 'bar' });

        action.on('mutated', (ev: IKeyValue) => {
          if (ev.type === 'errors') {
            errors = action.getErrors();
          }
        });

        return action().then(() => {
          expect(errors).to.deep.equal({});
        }, () => {
          expect(false, 'unexpected catch in promise').to.be.true;
        });
      });

      it('properly handles RequestError', () => {
        // tslint:disable-next-line:arrow-return-shorthand
        const action = createAction(() => {
          // @ts-ignore
          return new RequestError({
            data: { foo: 123 }
          }) as Error;
        });

        return action().then(() => {
          expect(false, 'unexpected then in promise').to.be.true;
        }, () => {
          expect(action.getErrors()).to.deep.equal({ foo: 123 });
        });
      });
    });

    describe('coextending', () => {
      let action1: IAction;
      let action2: IAction;

      beforeEach(() => {
        action1 = createAction(spy());
        action2 = action1.coextend();
      });

      it('properly creates a stack', () => {
        expect(action1).to.be.a('function');
        expect(action1.toString()).to.equal('RefraxAction(1) => spy');

        expect(action2).to.be.a('function');
        expect(action2.toString()).to.equal('RefraxAction(2) => spy');

        expect(action2._stack).to.deep.equal([
          action1._entity,
          action2._entity
        ]);
      });

      it('properly invokes stack and emits', () => {
        const spyAction1Start = spy();
        const spyAction2Start = spy();

        action1.on('start', spyAction1Start);
        action2.on('start', spyAction2Start);

        return action2()
          .then(() => {
            expect(spyAction1Start.callCount).to.equal(1);
            expect(spyAction2Start.callCount).to.equal(1);
          });
      });

      it('is separately mutable', () => {
        action1.set('bar', 'foo');
        action2.set('foo', 123);

        expect(action1.data).to.deep.equal({ bar: 'foo' });
        expect(action2.data).to.deep.equal({ foo: 123 });
      });
    });
  });
});
