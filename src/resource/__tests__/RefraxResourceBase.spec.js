/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import Promise from 'bluebird';
import RefraxResourceBase from 'RefraxResourceBase';
import RefraxOptions from 'RefraxOptions';
import RefraxParameters from 'RefraxParameters';
import RefraxPath from 'RefraxPath';
import RefraxQueryParameters from 'RefraxQueryParameters';
import RefraxSchemaPath from 'RefraxSchemaPath';
import RefraxSchema from 'RefraxSchema';
import RefraxFragmentResult from 'RefraxFragmentResult';
import RefraxConstants from 'RefraxConstants';
import createSchemaCollection from 'createSchemaCollection';

const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;

const dataCollectionUsers = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' }
];


/* global mock_get mock_reset mock_request_count wait_for_promise delay_for */
/* eslint-disable no-new, indent */
describe('RefraxResourceBase', () => {
  let schema;

  beforeEach(() => {
    schema = new RefraxSchema();

    schema.addLeaf(createSchemaCollection('users'));
  });

  describe('instantiation', () => {
    it('should require a valid accessor', () => {
      expect(() => {
        new RefraxResourceBase();
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResourceBase(123);
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResourceBase('foo');
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResourceBase({foo: 'bar'});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResourceBase(() => {});
      }).to.throw(Error, 'RefraxResourceBase expected valid SchemaPath');

      expect(() => {
        new RefraxResourceBase(schema.users);
      }).to.not.throw(Error);
    });

    it('should look like a ResourceBase', () => {
      var resource = new RefraxResourceBase(schema.users);

      expect(resource)
        .to.be.instanceof(RefraxResourceBase);
      expect(resource)
        .to.have.property('_schemaPath')
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

  describe('methods', () => {
    describe('_generateStack', () => {
      it('correctly represents the stack', () => {
        var resource = new RefraxResourceBase(
          schema.users,
          new RefraxQueryParameters({queryFoo: 123}),
          new RefraxParameters({paramFoo: 321}),
          new RefraxOptions({optionFoo: 111}),
          'pathFoo'
        );

        expect(resource._generateStack())
          .to.deep.equal([].concat(
            schema.users.__stack,
            new RefraxPath('pathFoo'),
            new RefraxParameters({paramFoo: 321}),
            new RefraxQueryParameters({queryFoo: 123}),
            new RefraxOptions({optionFoo: 111})
          ));
      });
    });

    describe('_generateDescriptor', () => {
      describe('invoked with no arguments', () => {
        it('generates a descriptor with a default action ', () => {
          var resource = new RefraxResourceBase(schema.users)
            , descriptor = resource._generateDescriptor(ACTION_GET);

          expect(descriptor.action).to.equal(ACTION_GET);
        });
      });

      describe('invoked with an action', () => {
        it('generates a descriptor using that action ', () => {
          var resource = new RefraxResourceBase(schema.users)
            , descriptor = resource._generateDescriptor(ACTION_CREATE);

          expect(descriptor.action).to.equal(ACTION_CREATE);
        });
      });
    });

    describe('fetch', () => {
      beforeEach(mock_reset);

      describe('invoked with', () => {
        describe('no arguments', () => {
          it('should look and behave as expected', () => {
            const resource = new RefraxResourceBase(schema.users);

            return delay_for()()
              .then(() => {
                mock_get('/users', dataCollectionUsers);

                expect(mock_request_count()).to.equal(0);

                const promise = resource.fetch();
                expect(promise).is.instanceof(Promise);

                return promise.then(([result, response, descriptor]) => {
                  expect(mock_request_count()).to.equal(1);
                  expect(result).is.instanceof(RefraxFragmentResult);
                  expect(result.data).to.deep.equal(dataCollectionUsers);
                });
              });
          });
        });

        describe('noFetchGet', () => {
          it('should look and behave as expected', () => {
            const resource = new RefraxResourceBase(schema.users);

            return delay_for()()
              .then(() => {
                mock_get('/users', dataCollectionUsers);

                expect(mock_request_count()).to.equal(0);

                const promise = resource.fetch({ noFetchGet: true });
                expect(promise).is.instanceof(Promise);

                return promise.then(([result, response, descriptor]) => {
                  expect(mock_request_count()).to.equal(0);
                  expect(result).is.instanceof(RefraxFragmentResult);
                  expect(result.data).to.equal(null);
                });
              });
            });
        });

        describe('fragmentOnly', () => {
          it('should look and behave as expected', () => {
            const resource = new RefraxResourceBase(schema.users);

            return delay_for()()
              .then(() => {
                mock_get('/users', dataCollectionUsers);

                expect(mock_request_count()).to.equal(0);

                const result = resource.fetch({ fragmentOnly: true });
                expect(result).is.instanceof(RefraxFragmentResult);

                const start = mock_request_count();
                return wait_for_promise(() => mock_request_count() !== start)
                  .then(() => {
                    expect(mock_request_count()).to.equal(1);
                  });
              });
            });
        });
      });
    });

    describe('get', () => {
      beforeEach(mock_reset);

      describe('invoked with no arguments', () => {
        it('should invoke a `get` descriptor', () => {
          const resource = new RefraxResourceBase(schema.users);

          mock_get('/users', dataCollectionUsers);

          expect(resource.fetch({ noFetchGet: true, fragmentOnly: true }).data).to.equal(null);

          return resource.get().then(([result, response, descriptor]) => {
            expect(result).is.instanceof(RefraxFragmentResult);
            expect(result.data).to.deep.equal(dataCollectionUsers);
          });
        });
      });
    });
  });
});
