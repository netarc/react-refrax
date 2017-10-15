/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';
import XHRAdapter from 'XHRAdapter';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import RefraxSchema from 'RefraxSchema';
import RefraxParameters from 'RefraxParameters';
import RefraxConstants from 'RefraxConstants';
import createSchemaCollection from 'createSchemaCollection';
import createSchemaResource from 'createSchemaResource';

const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_DELETE = RefraxConstants.action.delete;
const ACTION_UPDATE = RefraxConstants.action.update;


const dataUser1 = { id: 1, name: 'foo bob' };
const dataUser2 = { id: 2, name: 'foo baz' };
const dataUser3 = { id: 3, name: 'foo sue' };
const dataCollectionUsers = [
  dataUser1,
  dataUser2
];
const dataRules = {
  foo: 'bar',
  zip: 123
};

/* global mock_reset mock_get mock_put mock_post mock_delete */
/* eslint-disable no-new, indent */
describe('XHRAdapter', () => {
  let schema
    , storeUsers
    , storeRules
    , adapter;

  beforeEach(() => {
    mock_reset();

    adapter = new XHRAdapter();
    schema = new RefraxSchema({ adapter: adapter });
    schema.addLeaf(createSchemaCollection('users'));
    schema.addLeaf(createSchemaResource('rules'));

    storeUsers = schema.__node.definition.storeMap.getOrCreate('user');
    sinon.spy(storeUsers, 'touchResource');
    sinon.spy(storeUsers, 'updateResource');

    storeRules = schema.__node.definition.storeMap.getOrCreate('rule');
    sinon.spy(storeRules, 'touchResource');
    sinon.spy(storeRules, 'updateResource');
  });


  describe('instantiation', () => {
    it('should not accept invalid arguments', () => {
      expect(() => {
        new XHRAdapter(123);
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');

      expect(() => {
        new XHRAdapter(() => {});
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');

      expect(() => {
        new XHRAdapter('foo');
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');
    });

    it('should accept valid arguments', () => {
      expect(() => {
        new XHRAdapter();
      }).to.not.throw(Error);

      expect(() => {
        new XHRAdapter({ foo: 123 });
      }).to.not.throw(Error);
    });
  });

  describe('methods', () => {
    describe('invoke', () => {
      const invokeTestHelper = (action, stack, options) => {
        const {
          params,
          payload,
          expectedSignal
        } = options;

        stack = [].concat(stack, new RefraxParameters(params));
        const descriptor = new RefraxResourceDescriptor(null, action, stack);
        descriptor.payload = payload;

        const promise = adapter.invoke(descriptor);

        expect(promise).to.be.instanceof(Promise);

        return promise
          .then((result) => {
            expect(storeUsers.touchResource.callCount).to.equal(descriptor.store === storeUsers ? 1 : 0);
            expect(storeUsers.updateResource.callCount).to.equal(0);
            expect(storeRules.touchResource.callCount).to.equal(descriptor.store === storeRules ? 1 : 0);
            expect(storeRules.updateResource.callCount).to.equal(0);
            expect(result).to.be.a('array');
            expect(result.length).to.equal(3);
            expect(result[0]).to.deep.equal(expectedSignal);

            if (descriptor.action === ACTION_DELETE) {
              expect(result[1]).to.deep.match({
                request: Object,
                status: 200
              });
            }
            else {
              expect(result[1]).to.deep.match({
                data: expectedSignal,
                request: Object,
                status: 200
              });
            }
            expect(result[2]).to.equal(descriptor);
          });
      };

      it('should not accept invalid arguments', () => {
        expect(() => {
          adapter.invoke();
        }).to.throw(TypeError, 'expected descriptor, but found');

        expect(() => {
          adapter.invoke(123);
        }).to.throw(TypeError, 'expected descriptor, but found');

        expect(() => {
          adapter.invoke({ foo: 123 });
        }).to.throw(TypeError, 'expected descriptor, but found');

        expect(() => {
          adapter.invoke('foo');
        }).to.throw(TypeError, 'expected descriptor, but found');
      });

      describe('with a Collection descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            mock_get('/users', dataCollectionUsers);

            return invokeTestHelper(ACTION_GET, schema.users.__stack, {
              expectedSignal: dataCollectionUsers
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            const expected = {
              id: 1,
              name: 'bob foo'
            };

            mock_post('/users', expected);

            return invokeTestHelper(ACTION_CREATE, schema.users.__stack, {
              payload: { name: expected.name },
              expectedSignal: expected
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/users', [dataUser3]);

            return invokeTestHelper(ACTION_UPDATE, schema.users.__stack, {
              payload: [dataUser3],
              expectedSignal: [dataUser3]
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/users');

            return invokeTestHelper(ACTION_DELETE, schema.users.__stack, {
              expectedSignal: null
            });
          });
        });
      });

      describe('with a Collection Item descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            mock_get('/users/1', dataUser1);

            return invokeTestHelper(ACTION_GET, schema.users.user.__stack, {
              params: { userId: 1 },
              expectedSignal: dataUser1
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            mock_post('/users/3', dataUser3);

            return invokeTestHelper(ACTION_CREATE, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/users/3', dataUser3);

            return invokeTestHelper(ACTION_UPDATE, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/users/2');

            return invokeTestHelper(ACTION_DELETE, schema.users.user.__stack, {
              params: { userId: 2 },
              expectedSignal: null
            });
          });
        });
      });

      describe('with a Resource descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            mock_get('/rules', dataRules);

            return invokeTestHelper(ACTION_GET, schema.rules.__stack, {
              expectedSignal: dataRules
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            mock_post('/rules', dataRules);

            return invokeTestHelper(ACTION_CREATE, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/rules', dataRules);

            return invokeTestHelper(ACTION_UPDATE, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/rules');

            return invokeTestHelper(ACTION_DELETE, schema.rules.__stack, {
              expectedSignal: null
            });
          });
        });
      });
    });
  });
});
