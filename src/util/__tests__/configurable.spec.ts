/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from 'util/composableHash';
import { Configurable, extendConfigurable } from 'util/configurable';

// tslint:disable no-empty

describe('extendConfigurable', () => {
  let configurable: Configurable;
  let spyOptionsExtend: SinonSpy;
  let spyParamsExtend: SinonSpy;
  let spyQueryParamsExtend: SinonSpy;

  beforeEach(() => {
    configurable = extendConfigurable({});

    spyOptionsExtend = spy(configurable._options, 'extend');
    spyParamsExtend = spy(configurable._parameters, 'extend');
    spyQueryParamsExtend = spy(configurable._queryParams, 'extend');
  });

  describe('when invoked', () => {
    it('should not accept an empty target', () => {
      expect(() => {
        extendConfigurable();
      }).to.throw(Error, 'extendConfigurable: Exepected non-null target');
    });

    it('should look like extendConfigurable', () => {
      expect(configurable).to.have.property('_options')
        .that.is.an.instanceof(RefraxOptions);
      expect(configurable).to.have.property('_parameters')
        .that.is.an.instanceof(RefraxParameters);
      expect(configurable).to.have.property('_queryParams')
        .that.is.an.instanceof(RefraxQueryParameters);
    });
  });

  describe('methods', () => {
    describe('withOptions', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.withOptions(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(1);
        expect(spyParamsExtend.callCount).to.equal(0);
        expect(spyQueryParamsExtend.callCount).to.equal(0);
        expect(spyOptionsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyOptionsExtend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', () => {

        expect(configurable.withOptions({}))
          .to.equal(configurable);
      });

      it('should return other with clone', () => {
        configurable.clone = () => extendConfigurable({});

        expect(configurable.withOptions({}))
          .to.not.equal(configurable);
      });
    });

    describe('withParams', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.withParams(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.callCount).to.equal(1);
        expect(spyQueryParamsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyParamsExtend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', () => {

        expect(configurable.withParams({}))
          .to.equal(configurable);
      });

      it('should return other with clone', () => {
        configurable.clone = () => extendConfigurable({});

        expect(configurable.withParams({}))
          .to.not.equal(configurable);
      });
    });

    describe('withQueryParams', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.withQueryParams(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.callCount).to.equal(0);
        expect(spyQueryParamsExtend.callCount).to.equal(1);
        expect(spyQueryParamsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyQueryParamsExtend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', () => {

        expect(configurable.withQueryParams({}))
          .to.equal(configurable);
      });

      it('should return other with clone', () => {
        configurable.clone = () => extendConfigurable({});

        expect(configurable.withQueryParams({}))
          .to.not.equal(configurable);
      });
    });

    describe('seIKeyValue', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.seIKeyValue(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(1);
        expect(spyParamsExtend.callCount).to.equal(0);
        expect(spyQueryParamsExtend.callCount).to.equal(0);
        expect(spyOptionsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyOptionsExtend.getCall(0).args[1]).to.equal(fn1);
      });
    });

    describe('setParams', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.setParams(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.callCount).to.equal(1);
        expect(spyQueryParamsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyParamsExtend.getCall(0).args[1]).to.equal(fn1);
      });
    });

    describe('setQueryParams', () => {
      it('should forward to internal extend', () => {
        const arg1 = { foo: 123 };
        const fn1 = () => {};

        configurable.setQueryParams(arg1, fn1);

        expect(spyOptionsExtend.callCount).to.equal(0);
        expect(spyParamsExtend.callCount).to.equal(0);
        expect(spyQueryParamsExtend.callCount).to.equal(1);
        expect(spyQueryParamsExtend.getCall(0).args[0]).to.equal(arg1);
        expect(spyQueryParamsExtend.getCall(0).args[1]).to.equal(fn1);
      });
    });
  });
});
