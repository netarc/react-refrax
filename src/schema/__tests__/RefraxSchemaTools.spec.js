/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxStore = require('RefraxStore');
const RefraxSchemaTools = require('RefraxSchemaTools');
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxSchemaTools', function() {
  describe('methods', function() {
    describe('validatePath', function() {
      it('should throw an error with an invalid path', function() {
        expect(function() {
          RefraxSchemaTools.validatePath('', 123);
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          RefraxSchemaTools.validatePath('', function() {});
        }).to.throw(Error, 'A valid path must be passed');

        expect(function() {
          RefraxSchemaTools.validatePath('', {foo: 'bar'});
        }).to.throw(Error, 'A valid path must be passed');
      });

      it('should return a clean path', function() {
        var result = RefraxSchemaTools.validatePath('', ' foobar ');

        expect(result).to.equal('foobar');
      });
    });

    describe('defaultStore', function() {
      describe('with an identifier argument', function() {
        it('should use an identifer with no store param', function() {
          var result = RefraxSchemaTools.defaultStore('', 'users');

          expect(result)
            .that.is.instanceof(RefraxStore)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'user'
            });
        });
      });

      describe('with a store argument', function() {
        it('should throw an error with an invalid store', function() {
          expect(function() {
            RefraxSchemaTools.defaultStore('', 'bar', 123);
          }).to.throw(Error, 'A valid store reference');

          expect(function() {
            RefraxSchemaTools.defaultStore('', 'bar', function() {});
          }).to.throw(Error, 'A valid store reference');

          expect(function() {
            RefraxSchemaTools.defaultStore('', 'bar', {foo: 'bar'});
          }).to.throw(Error, 'A valid store reference');
        });

        it('should use a specified string for a store type', function() {
          var result = RefraxSchemaTools.defaultStore('', 'bar', 'users');

          expect(result)
            .that.is.instanceof(RefraxStore)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'users'
            });
        });

        it('should use a store instance', function() {
          var result = RefraxSchemaTools.defaultStore('', 'bar', new RefraxStore('users'));

          expect(result)
            .that.is.instanceof(RefraxStore)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'users'
            });
        });
      });
    });
  });
});
