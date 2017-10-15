/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import eventemitter3 from 'eventemitter3';
import mixinSubscribable from 'mixinSubscribable';


describe('mixinSubscribable', function() {
  describe('when invoked', function() {
    it('should not accept an empty target', function() {
      expect(function() {
        mixinSubscribable();
      }).to.throw(TypeError, 'exepected non-null target');
    });

    it('should look like mixinSubscribable', function() {
      var subscribable = mixinSubscribable({});

      expect(subscribable).to.have.property('_emitter')
        .that.is.an.instanceof(eventemitter3);
      expect(subscribable).to.have.property('subscribe')
        .that.is.a('function');
      expect(subscribable).to.have.property('emit')
        .that.is.a('function');
    });
  });

  describe('methods', function() {
    describe('subscribe', function() {
      describe('when passed invalid arguments', function() {
        it('should throw an error', function() {
          var subscribable = mixinSubscribable({});

          expect(function() {
            subscribable.subscribe();
          }).to.throw(TypeError, 'expected string event');

          expect(function() {
            subscribable.subscribe('foobar');
          }).to.throw(TypeError, 'expected callback but found');
        });
      });

      describe('when passed valid arguments', function() {
        it('should subscribe and return a dispose method', function() {
          var subscribable = mixinSubscribable({})
            , disposer;

          expect(subscribable._emitter.listeners('foo_event').length).to.equal(0);

          disposer = subscribable.subscribe('foo_event', function() {});
          expect(disposer).to.be.a('function');
          expect(subscribable._emitter.listeners('foo_event').length).to.equal(1);

          disposer();
          expect(subscribable._emitter.listeners('foo_event').length).to.equal(0);
        });
      });
    });

    describe('emit', function() {
      describe('when passed invalid arguments', function() {
        it('should properly throw an error', function() {
          var subscribable = mixinSubscribable({});

          expect(subscribable.emit()).to.equal(false);
          expect(subscribable.emit(123)).to.equal(false);
        });
      });

      describe('when passed valid arguments', function() {
        it('should emit a subscribed event', function() {
          var subscribable = mixinSubscribable({})
            , callback1 = sinon.spy()
            , callback2 = sinon.spy();

          subscribable.subscribe('foobar', callback1);
          subscribable.subscribe('barfoo', callback2);
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);

          subscribable.emit('foobar');
          expect(callback1.callCount).to.equal(1);
          expect(callback2.callCount).to.equal(0);
        });

        it('should not emit a disposed event', function() {
          var subscribable = mixinSubscribable({})
            , callback1 = sinon.spy()
            , callback2 = sinon.spy()
            , disposer;

          disposer = subscribable.subscribe('foobar', callback1);
          subscribable.subscribe('barfoo', callback2);
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);

          disposer();
          subscribable.emit('foobar');
          expect(callback1.callCount).to.equal(0);
          expect(callback2.callCount).to.equal(0);
        });
      });
    });
  });
});
