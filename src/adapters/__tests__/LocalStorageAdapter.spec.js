/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const Promise = require('bluebird');
const LocalStorageAdapter = require('LocalStorageAdapter');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxSchema = require('RefraxSchema');
const RefraxParameters = require('RefraxParameters');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const createSchemaCollection = require('createSchemaCollection');
const createSchemaResource = require('createSchemaResource');
const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_DELETE = RefraxConstants.action.delete;
const ACTION_UPDATE = RefraxConstants.action.update;
const expect = chai.expect;

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

/* global mock_reset */
/* eslint-disable no-new, indent */
describe('LocalStorageAdapter', () => {
  let schema
    , storeUsers
    , storeRules
    , adapter;

  beforeEach(() => {
    mock_reset();

    adapter = new LocalStorageAdapter();
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
        new LocalStorageAdapter(123);
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');

      expect(() => {
        new LocalStorageAdapter(() => {});
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');

      expect(() => {
        new LocalStorageAdapter('foo');
      }).to.throw(TypeError, 'attempting to pass an invalid config of type');
    });

    it('should accept valid arguments', () => {
      expect(() => {
        new LocalStorageAdapter();
      }).to.not.throw(Error);

      expect(() => {
        new LocalStorageAdapter({ foo: 123 });
      }).to.not.throw(Error);
    });
  });

  describe('methods', () => {
    describe('invoke', () => {
      const invokeTestHelper = (action, stack, options) => {
        const {
          seed,
          params,
          payload,
          expectedSignal,
          expectedStorage
        } = options;

        stack = [].concat(stack, new RefraxParameters(params));
        const descriptor = new RefraxResourceDescriptor(null, action, stack);
        descriptor.payload = payload;

        if (seed) {
          RefraxTools.each(seed, (value, key) => {
            global.window.localStorage.setItem(key, JSON.stringify(value));
          });
        }

        const promise = adapter.invoke(descriptor);

        expect(promise).to.be.instanceof(Promise);

        return promise
          .then((result) => {
            expect(storeUsers.touchResource.callCount).to.equal(0);
            expect(storeUsers.updateResource.callCount).to.equal(0);
            expect(storeRules.touchResource.callCount).to.equal(0);
            expect(storeRules.updateResource.callCount).to.equal(0);
            expect(result).to.be.a('array');
            expect(result.length).to.equal(3);
            expect(result[0]).to.deep.equal(expectedSignal);
            expect(result[1]).to.deep.match({
              data: expectedSignal,
              request: Object,
              status: 200
            });
            expect(result[2]).to.equal(descriptor);

            if (expectedStorage) {
              if (RefraxTools.keysFor(expectedStorage).length === 0) {
                expect(window.localStorage.__storage).to.be.empty;
              }
              else {
                expect(window.localStorage.__storage)
                  .to.have.all.keys(RefraxTools.keysFor(expectedStorage));
              }

              RefraxTools.each(window.localStorage.__storage, (encoded, key) => {
                expect(JSON.parse(encoded)).to.deep.equal(expectedStorage[key], key);
              });
            }
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
            return invokeTestHelper(ACTION_GET, schema.users.__stack, {
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
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

            return invokeTestHelper(ACTION_CREATE, schema.users.__stack, {
              payload: { name: expected.name },
              expectedSignal: expected,
              expectedStorage: {
                '/users': { list: [expected], guid: 1 },
                '/users/1': expected
              }
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            return invokeTestHelper(ACTION_UPDATE, schema.users.__stack, {
              payload: [dataUser3],
              expectedSignal: [dataUser3],
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            return invokeTestHelper(ACTION_DELETE, schema.users.__stack, {
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
              expectedSignal: null,
              expectedStorage: {
                '/users/1': dataUser1,
                '/users/2': dataUser2
              }
            });
          });
        });
      });

      describe('with a Collection Item descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            return invokeTestHelper(ACTION_GET, schema.users.user.__stack, {
              params: { userId: 1 },
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
              expectedSignal: dataUser1
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            return invokeTestHelper(ACTION_CREATE, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: { name: dataUser3.name },
              expectedSignal: dataUser3,
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            return invokeTestHelper(ACTION_UPDATE, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3,
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            return invokeTestHelper(ACTION_DELETE, schema.users.user.__stack, {
              params: { userId: 2 },
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
              expectedSignal: null,
              expectedStorage: {
                '/users': { list: [dataUser1], guid: 2 },
                '/users/1': dataUser1
              }
            });
          });
        });
      });

      describe('with a Resource descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            return invokeTestHelper(ACTION_GET, schema.rules.__stack, {
              seed: {
                '/rules': dataRules
              },
              expectedSignal: dataRules
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            return invokeTestHelper(ACTION_CREATE, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules,
              expectedStorage: {
                '/rules': dataRules
              }
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            return invokeTestHelper(ACTION_UPDATE, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules,
              expectedStorage: {
                '/rules': dataRules
              }
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            return invokeTestHelper(ACTION_DELETE, schema.rules.__stack, {
              seed: {
                '/rules': dataRules
              },
              expectedSignal: null,
              expectedStorage: {
              }
            });
          });
        });
      });
    });
  });
});
