/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const TestHelper = require('TestHelper');
const RefraxResourceBase = require('RefraxResourceBase');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxPath = require('RefraxPath');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxConstants = require('RefraxConstants');
const createSchemaCollection = require('createSchemaCollection');
const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxResourceBase', function() {
  var collectionAccessor;

  beforeEach(function() {
    collectionAccessor = createSchemaCollection('users');
  });

  afterEach(TestHelper.deleteStores);

  describe('instantiation', function() {
    it('should require a valid accessor', function() {
      expect(function() {
        new RefraxResourceBase();
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaNodeAccessor');

      expect(function() {
        new RefraxResourceBase(123);
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaNodeAccessor');

      expect(function() {
        new RefraxResourceBase('foo');
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaNodeAccessor');

      expect(function() {
        new RefraxResourceBase({foo: 'bar'});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaNodeAccessor');

      expect(function() {
        new RefraxResourceBase(function() {});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaNodeAccessor');

      expect(function() {
        new RefraxResourceBase(collectionAccessor);
      }).to.not.throw(Error);
    });

    it('should look like a ResourceBase', function() {
      var resource = new RefraxResourceBase(collectionAccessor);

      expect(resource)
        .to.be.instanceof(RefraxResourceBase);
      expect(resource)
        .to.have.property('_accessor')
          .that.is.an.instanceof(RefraxSchemaPath);
      expect(resource)
        .to.have.property('_paths')
          .that.is.an.instanceof(Array);
      expect(resource)
        .to.have.property('_options')
          .that.is.an.instanceof(RefraxOptions);
      expect(resource)
        .to.have.property('_parameters')
          .that.is.an.instanceof(RefraxParameters);
      expect(resource)
        .to.have.property('_queryParams')
          .that.is.an.instanceof(RefraxQueryParameters);
    });
  });

  describe('methods', function() {
    describe('_generateStack', function() {
      it('correctly represents the stack', function() {
        var resource = new RefraxResourceBase(
          collectionAccessor,
          new RefraxQueryParameters({queryFoo: 123}),
          new RefraxParameters({paramFoo: 321}),
          new RefraxOptions({optionFoo: 111}),
          'pathFoo'
        );

        expect(resource._generateStack())
          .to.deep.equal([].concat(
            collectionAccessor.__stack,
            new RefraxPath('pathFoo'),
            {paramFoo: 321},
            {queryFoo: 123},
            {optionFoo: 111}
          ));
      });

      it('correctly uses params options', function() {
        var options = new RefraxOptions({
            paramsGenerator: function() {
              return {
                paramFoo: 'abc'
              };
            },
            params: {
              paramBar: 'bar'
            }
          })
          , resource = new RefraxResourceBase(
          collectionAccessor,
          new RefraxQueryParameters({queryFoo: 123}),
          new RefraxParameters({paramFoo: 321}),
          options,
          'pathFoo'
        );

        expect(resource._generateStack())
          .to.deep.equal([].concat(
            collectionAccessor.__stack,
            new RefraxPath('pathFoo'),
            {paramFoo: 321},
            {queryFoo: 123},
            options,
            {paramFoo: 'abc'},
            {paramBar: 'bar'}
          ));
      });
    });

    describe('_generateDescriptor', function() {
      describe('invoked with no arguments', function() {
        it('generates a descriptor with a default action ', function() {
          var resource = new RefraxResourceBase(collectionAccessor)
            , descriptor = resource._generateDescriptor();

          expect(descriptor.action).to.equal(ACTION_GET);
        });
      });

      describe('invoked with an action', function() {
        it('generates a descriptor using that action ', function() {
          var resource = new RefraxResourceBase(collectionAccessor)
            , descriptor = resource._generateDescriptor(ACTION_CREATE);

          expect(descriptor.action).to.equal(ACTION_CREATE);
        });
      });
    });
  });
});
