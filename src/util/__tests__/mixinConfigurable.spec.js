/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const mixinConfigurable = require('mixinConfigurable');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxQueryParameters = require('RefraxQueryParameters');
const expect = chai.expect;


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
      it('should require a valid options argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.withOptions(123);
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

        expect(function() {
          configurable.withOptions(function() { });
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

        expect(function() {
          configurable.withOptions('foobar');
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _options: {foo: 321} });

        configurable1.withOptions({bar: 123});
        expect(configurable1._parameters).deep.equals({});
        expect(configurable1._queryParams).deep.equals({});
        expect(configurable1._options).deep.equals({
          bar: 123
        });

        configurable2.withOptions({bar: 123});
        expect(configurable2._parameters).deep.equals({});
        expect(configurable2._queryParams).deep.equals({});
        expect(configurable2._options).deep.equals({
          foo: 321,
          bar: 123
        });
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
      it('should require a valid params argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.withParams(123);
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

        expect(function() {
          configurable.withParams(function() { });
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

        expect(function() {
          configurable.withParams('foobar');
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _parameters: {foo: 321} });

        configurable1.withParams({bar: 123});
        expect(configurable1._options).deep.equals({});
        expect(configurable1._queryParams).deep.equals({});
        expect(configurable1._parameters).deep.equals({
          bar: 123
        });

        configurable2.withParams({bar: 123});
        expect(configurable2._options).deep.equals({});
        expect(configurable2._queryParams).deep.equals({});
        expect(configurable2._parameters).deep.equals({
          foo: 321,
          bar: 123
        });
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
      it('should require a valid query params argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.withQueryParams(123);
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

        expect(function() {
          configurable.withQueryParams(function() { });
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

        expect(function() {
          configurable.withQueryParams('foobar');
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _queryParams: {foo: 321} });

        configurable1.withQueryParams({bar: 123});
        expect(configurable1._options).deep.equals({});
        expect(configurable1._parameters).deep.equals({});
        expect(configurable1._queryParams).deep.equals({
          bar: 123
        });

        configurable2.withQueryParams({bar: 123});
        expect(configurable2._options).deep.equals({});
        expect(configurable2._parameters).deep.equals({});
        expect(configurable2._queryParams).deep.equals({
          foo: 321,
          bar: 123
        });
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
      it('should require a valid options argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.setOptions(123);
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

        expect(function() {
          configurable.setOptions(function() { });
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');

        expect(function() {
          configurable.setOptions('foobar');
        }).to.throw(Error, 'RefraxOptions expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _options: {foo: 321} });

        configurable1.setOptions({bar: 123});
        expect(configurable1._parameters).deep.equals({});
        expect(configurable1._queryParams).deep.equals({});
        expect(configurable1._options).deep.equals({
          bar: 123
        });

        configurable2.setOptions({bar: 123});
        expect(configurable2._parameters).deep.equals({});
        expect(configurable2._queryParams).deep.equals({});
        expect(configurable2._options).deep.equals({
          foo: 321,
          bar: 123
        });
      });
    });

    describe('setParams', function() {
      it('should require a valid params argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.setParams(123);
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

        expect(function() {
          configurable.setParams(function() { });
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');

        expect(function() {
          configurable.setParams('foobar');
        }).to.throw(Error, 'RefraxParameters expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _parameters: {foo: 321} });

        configurable1.setParams({bar: 123});
        expect(configurable1._options).deep.equals({});
        expect(configurable1._queryParams).deep.equals({});
        expect(configurable1._parameters).deep.equals({
          bar: 123
        });

        configurable2.setParams({bar: 123});
        expect(configurable2._options).deep.equals({});
        expect(configurable2._queryParams).deep.equals({});
        expect(configurable2._parameters).deep.equals({
          foo: 321,
          bar: 123
        });
      });
    });

    describe('setQueryParams', function() {
      it('should require a valid query params argument', function() {
        var configurable = mixinConfigurable({});

        expect(function() {
          configurable.setQueryParams(123);
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

        expect(function() {
          configurable.setQueryParams(function() { });
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');

        expect(function() {
          configurable.setQueryParams('foobar');
        }).to.throw(Error, 'RefraxQueryParameters expected argument of type `Object`');
      });

      it('should correctly update', function() {
        var configurable1 = mixinConfigurable({})
          , configurable2 = mixinConfigurable({}, { _queryParams: {foo: 321} });

        configurable1.setQueryParams({bar: 123});
        expect(configurable1._options).deep.equals({});
        expect(configurable1._parameters).deep.equals({});
        expect(configurable1._queryParams).deep.equals({
          bar: 123
        });

        configurable2.setQueryParams({bar: 123});
        expect(configurable2._options).deep.equals({});
        expect(configurable2._parameters).deep.equals({});
        expect(configurable2._queryParams).deep.equals({
          foo: 321,
          bar: 123
        });
      });
    });
  });
});
