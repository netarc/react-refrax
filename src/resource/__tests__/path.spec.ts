/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { RefraxPath } from '../../resource/path';

// tslint:disable: no-magic-numbers no-unused-expression no-empty

describe('RefraxPath', () => {
  describe('instantiation', () => {
    it('should throw an error on invalid path', () => {
      expect(() => {
        // @ts-ignore - invalid argument
        new RefraxPath(123);
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');

      expect(() => {
        // @ts-ignore - invalid argument
        new RefraxPath({ foo: 'bar' });
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');

      expect(() => {
        // @ts-ignore - invalid argument
        new RefraxPath(() => {});
      }).to.throw(Error, 'RefraxPath expected path argument of type `String`');
    });

    it('should accept correct arguments and look like a RefraxPath', () => {
      const result = new RefraxPath('/users', true);

      expect(result)
        .that.is.an.instanceof(RefraxPath)
        .to.have.property('path');
      expect(result)
        .to.have.property('isModifier');
    });

    it('should properly clean path argument', () => {
      expect(new RefraxPath('/ users ', true).path).to.equal('users');
      expect(new RefraxPath(' /users', true).path).to.equal('users');
    });

    it('should properly represent modifier argument', () => {
      expect(new RefraxPath('users ', true).isModifier).to.equal(true);
      expect(new RefraxPath('users', false).isModifier).to.equal(false);
      // @ts-ignore - invalid argument
      expect(new RefraxPath('users', 123).isModifier).to.equal(true);
      // @ts-ignore - invalid argument
      expect(new RefraxPath('users', 'foo').isModifier).to.equal(true);
      // @ts-ignore - invalid argument
      expect(new RefraxPath('users', { foo: 'bar' }).isModifier).to.equal(true);
    });
  });
});
