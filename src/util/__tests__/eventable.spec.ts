/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { EventEmitter } from 'eventemitter3';
import { spy } from 'sinon';

import { Disposable } from 'util/disposable';
import { extendEventable } from 'util/eventable';

// tslint:disable no-empty no-magic-numbers

describe('extendEventable', () => {
  describe('when invoked', () => {
    it('should not accept an empty target', () => {
      expect(() => {
        extendEventable();
      }).to.throw(Error, 'extendEventable: Exepected non-null target');
    });

    it('should look like extendEventable', () => {
      const eventable = extendEventable({});

      expect(eventable).to.have.property('_emitter')
        .that.is.an.instanceof(EventEmitter);
      expect(eventable).to.have.property('on')
        .that.is.a('function');
      expect(eventable).to.have.property('emit')
        .that.is.a('function');
    });
  });

  describe('methods', () => {
    describe('on', () => {
      describe('when passed invalid arguments', () => {
        it('should throw an error', () => {
          const eventable = extendEventable({});

          expect(() => {
            eventable.on();
          }).to.throw(Error, 'expected string event');

          expect(() => {
            eventable.on('foobar');
          }).to.throw(Error, 'expected callback but found');
        });
      });

      describe('when passed valid arguments', () => {
        it('should subscribe and return a dispose method', () => {
          const eventable = extendEventable({});
          let disposer;

          expect(eventable._emitter.listeners('foo_event').length).to.equal(0);

          disposer = eventable.on('foo_event', () => {});
          expect(disposer).to.be.instanceof(Disposable);
          expect(eventable._emitter.listeners('foo_event').length).to.equal(1);

          disposer.dispose();
          expect(eventable._emitter.listeners('foo_event').length).to.equal(0);
        });
      });
    });

    describe('emit', () => {
      describe('when passed invalid arguments', () => {
        it('should properly throw an error', () => {
          const eventable = extendEventable({});

          expect(eventable.emit()).to.equal(false);
          expect(eventable.emit(123)).to.equal(false);
        });
      });

      describe('when passed valid arguments', () => {
        it('should emit a subscribed event', () => {
          const eventable = extendEventable({});
          const callback1 = spy();
          const callback2 = spy();

          eventable.on('foobar', callback1);
          eventable.on('barfoo', callback2);
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);

          eventable.emit('foobar');
          expect(callback1.callCount).to.equal(1);
          expect(callback2.callCount).to.equal(0);
        });

        it('should not emit a disposed event', () => {
          const eventable = extendEventable({});
          const callback1 = spy();
          const callback2 = spy();
          const disposer = eventable.on('foobar', callback1);

          eventable.on('barfoo', callback2);
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);

          disposer.dispose();
          eventable.emit('foobar');
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);
        });
      });
    });
  });
});
