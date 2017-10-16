/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import mixinConfigurable from 'mixinConfigurable';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxQueryParameters from 'RefraxQueryParameters';


describe('mixinConfigurable', function() {
  describe('when invoked', function() {
    it('should not accept an empty target', function() {
      expect(function() {
        mixinConfigurable();
      }).to.throw(TypeError, 'exepected non-null target');
    });

    it('should look like mixinConfigurable', function() {
      var configurable = mixinConfigurable({});

      expect(configurable).to.have.property('_options')
        .that.is.an.instanceof(RefraxOptions);
      expect(configurable).to.have.property('_parameters')
        .that.is.an.instanceof(RefraxParameters);
      expect(configurable).to.have.property('_queryParams')
        .that.is.an.instanceof(RefraxQueryParameters);
    });
  });

  describe('methods', function() {
    describe('withOptions', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.withOptions(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(1);
        expect(configurable._parameters.extend.callCount).to.equal(0);
        expect(configurable._queryParams.extend.callCount).to.equal(0);
        expect(configurable._options.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._options.extend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', function() {
        var configurable = mixinConfigurable({});

        expect(configurable.withOptions({}))
          .to.equal(configurable);
      });

      it('should return other with clone', function() {
        var configurable = mixinConfigurable({
          clone: function() {
            return mixinConfigurable({});
          }
        });

        expect(configurable.withOptions({}))
          .to.not.equal(configurable);
      });
    });

    describe('withParams', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.withParams(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.callCount).to.equal(1);
        expect(configurable._queryParams.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._parameters.extend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', function() {
        var configurable = mixinConfigurable({});

        expect(configurable.withParams({}))
          .to.equal(configurable);
      });

      it('should return other with clone', function() {
        var configurable = mixinConfigurable({
          clone: function() {
            return mixinConfigurable({});
          }
        });

        expect(configurable.withParams({}))
          .to.not.equal(configurable);
      });
    });

    describe('withQueryParams', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.withQueryParams(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.callCount).to.equal(0);
        expect(configurable._queryParams.extend.callCount).to.equal(1);
        expect(configurable._queryParams.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._queryParams.extend.getCall(0).args[1]).to.equal(fn1);
      });

      it('should return self with no clone', function() {
        var configurable = mixinConfigurable({});

        expect(configurable.withQueryParams({}))
          .to.equal(configurable);
      });

      it('should return other with clone', function() {
        var configurable = mixinConfigurable({
          clone: function() {
            return mixinConfigurable({});
          }
        });

        expect(configurable.withQueryParams({}))
          .to.not.equal(configurable);
      });
    });

    describe('setOptions', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.setOptions(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(1);
        expect(configurable._parameters.extend.callCount).to.equal(0);
        expect(configurable._queryParams.extend.callCount).to.equal(0);
        expect(configurable._options.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._options.extend.getCall(0).args[1]).to.equal(fn1);
      });
    });

    describe('setParams', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.setParams(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.callCount).to.equal(1);
        expect(configurable._queryParams.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._parameters.extend.getCall(0).args[1]).to.equal(fn1);
      });
    });

    describe('setQueryParams', function() {
      it('should forward to internal extend', function() {
        var configurable = mixinConfigurable({})
          , arg1 = { foo: 123 }
          , fn1 = () => {};

        sinon.spy(configurable._options, 'extend');
        sinon.spy(configurable._parameters, 'extend');
        sinon.spy(configurable._queryParams, 'extend');

        configurable.setQueryParams(arg1, fn1);

        expect(configurable._options.extend.callCount).to.equal(0);
        expect(configurable._parameters.extend.callCount).to.equal(0);
        expect(configurable._queryParams.extend.callCount).to.equal(1);
        expect(configurable._queryParams.extend.getCall(0).args[0]).to.equal(arg1);
        expect(configurable._queryParams.extend.getCall(0).args[1]).to.equal(fn1);
      });
    });
  });
});
