/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { defaultStore, validatePath } from '../../schema/tools';
import { Store } from '../../store/store';

// tslint:disable: no-magic-numbers no-empty

describe('SchemaTools', () => {
  describe('methods', () => {
    describe('validatePath', () => {
      it('should throw an error with an invalid path', () => {
        expect(() => {
          // @ts-ignore argument mis-match
          validatePath('', 123);
        }).to.throw(Error, 'A valid path must be passed');

        expect(() => {
          // @ts-ignore argument mis-match
          validatePath('', () => {});
        }).to.throw(Error, 'A valid path must be passed');

        expect(() => {
          // @ts-ignore argument mis-match
          validatePath('', { foo: 'bar' });
        }).to.throw(Error, 'A valid path must be passed');
      });

      it('should return a clean path', () => {
        const result = validatePath('', ' foobar ');

        expect(result).to.equal('foobar');
      });
    });

    describe('defaultStore', () => {
      describe('with an identifier argument', () => {
        it('should use an identifer with no store param', () => {
          const result = defaultStore('', 'users');

          expect(result)
            .that.is.instanceof(Store)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'user'
            });
        });
      });

      describe('with a store argument', () => {
        it('should throw an error with an invalid store', () => {
          expect(() => {
          // @ts-ignore argument mis-match
          defaultStore('', 'bar', 123);
          }).to.throw(Error, 'A valid store reference');

          expect(() => {
          // @ts-ignore argument mis-match
          defaultStore('', 'bar', () => {});
          }).to.throw(Error, 'A valid store reference');

          expect(() => {
          // @ts-ignore argument mis-match
          defaultStore('', 'bar', { foo: 'bar' });
          }).to.throw(Error, 'A valid store reference');
        });

        it('should use a specified string for a store type', () => {
          const result = defaultStore('', 'bar', 'users');

          expect(result)
            .that.is.instanceof(Store)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'users'
            });
        });

        it('should use a store instance', () => {
          const result = defaultStore('', 'bar', new Store('users'));

          expect(result)
            .that.is.instanceof(Store)
            .to.have.property('definition')
            .that.deep.equals({
              type: 'users'
            });
        });
      });
    });
  });
});
