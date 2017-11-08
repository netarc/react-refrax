/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Promise from 'bluebird';
import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import {
  mock_reset
} from 'test/TestSupport';

import { LocalStorageAdapter } from 'adapters/localStorage';
import { ResourceDescriptor } from 'resource/descriptor';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { createSchemaResource } from 'schema/createSchemaResource';
import { Schema } from 'schema/schema';
import { RefraxParameters } from 'util/composableHash';
import { each, keysFor } from 'util/tools';
import { IActionType, IKeyValue } from 'util/types';

// tslint:disable no-magic-numbers no-unused-expression no-empty

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

describe('LocalStorageAdapter', () => {
  let schema: Schema;
  let storeUsers;
  let storeRules;
  let adapter: LocalStorageAdapter;
  let spyStoreUsers_touchResource: SinonSpy;
  let spyStoreUsers_updateResource: SinonSpy;
  let spyStoreRules_touchResource: SinonSpy;
  let spyStoreRules_updateResource: SinonSpy;

  beforeEach(() => {
    mock_reset();

    adapter = new LocalStorageAdapter();
    schema = new Schema({ adapter });
    schema.addLeaf(createSchemaCollection('users'));
    schema.addLeaf(createSchemaResource('rules'));

    storeUsers = schema.__node.definition.storeMap.getOrCreate('user');
    spyStoreUsers_touchResource = spy(storeUsers, 'touchResource');
    spyStoreUsers_updateResource = spy(storeUsers, 'updateResource');

    storeRules = schema.__node.definition.storeMap.getOrCreate('rule');
    spyStoreRules_touchResource = spy(storeRules, 'touchResource');
    spyStoreRules_updateResource = spy(storeRules, 'updateResource');
  });

  describe('instantiation', () => {
    it('should not accept invalid arguments', () => {
      expect(() => {
        // @ts-ignore
        new LocalStorageAdapter(123);
      }).to.throw(Error, 'attempting to pass an invalid config of type');

      expect(() => {
        // @ts-ignore
        new LocalStorageAdapter(() => {});
      }).to.throw(Error, 'attempting to pass an invalid config of type');

      expect(() => {
        // @ts-ignore
        new LocalStorageAdapter('foo');
      }).to.throw(Error, 'attempting to pass an invalid config of type');
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
      const invokeTestHelper = (action: IActionType, stack: any[], options: IKeyValue) => {
        const {
          seed,
          params,
          payload,
          expectedSignal,
          expectedStorage
        }: {
          seed?: IKeyValue;
          params?: IKeyValue;
          payload?: any;
          expectedSignal?: any;
          expectedStorage?: any;
        } = options;

        stack = ([] as any[]).concat(stack, new RefraxParameters(params));
        const descriptor = new ResourceDescriptor(null, action, stack);
        descriptor.payload = payload;

        if (seed) {
          each(seed, (value: any, key: string) => {
            (global as any).window.localStorage.setItem(key, JSON.stringify(value));
          });
        }

        const promise = adapter.invoke(descriptor);

        expect(promise).to.be.instanceof(Promise);

        return promise
          .then((result: any[]) => {
            expect(spyStoreUsers_touchResource.callCount).to.equal(0);
            expect(spyStoreUsers_updateResource.callCount).to.equal(0);
            expect(spyStoreRules_touchResource.callCount).to.equal(0);
            expect(spyStoreRules_updateResource.callCount).to.equal(0);
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
              if (keysFor(expectedStorage).length === 0) {
                expect(window.localStorage.__storage).to.be.empty;
              }
              else {
                expect(window.localStorage.__storage)
                  .to.have.all.keys(keysFor(expectedStorage));
              }

              each(window.localStorage.__storage, (encoded: string, key: string) => {
                expect(JSON.parse(encoded)).to.deep.equal(expectedStorage[key], key);
              });
            }
          });
      };

      it('should not accept invalid arguments', () => {
        expect(() => {
          adapter.invoke();
        }).to.throw(Error, 'expected descriptor, but found');

        expect(() => {
          // @ts-ignore
          adapter.invoke(123);
        }).to.throw(Error, 'expected descriptor, but found');

        expect(() => {
          // @ts-ignore
          adapter.invoke({ foo: 123 });
        }).to.throw(Error, 'expected descriptor, but found');

        expect(() => {
          // @ts-ignore
          adapter.invoke('foo');
        }).to.throw(Error, 'expected descriptor, but found');
      });

      describe('with a Collection descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () =>
            invokeTestHelper(IActionType.get, schema.users.__stack, {
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
              expectedSignal: dataCollectionUsers
            }));
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            const expected = {
              id: 1,
              name: 'bob foo'
            };

            return invokeTestHelper(IActionType.create, schema.users.__stack, {
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
          it('should correctly update entries', () =>
            invokeTestHelper(IActionType.update, schema.users.__stack, {
              payload: [dataUser3],
              expectedSignal: [dataUser3],
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            }));
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () =>
            invokeTestHelper(IActionType.delete, schema.users.__stack, {
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
            }));
        });
      });

      describe('with a Collection Item descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () =>
            invokeTestHelper(IActionType.get, schema.users.user.__stack, {
              params: { userId: 1 },
              seed: {
                '/users': { list: dataCollectionUsers, guid: 2 },
                '/users/1': dataUser1,
                '/users/2': dataUser2
              },
              expectedSignal: dataUser1
            }));
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () =>
            invokeTestHelper(IActionType.create, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: { name: dataUser3.name },
              expectedSignal: dataUser3,
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            }));
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () =>
            invokeTestHelper(IActionType.update, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3,
              expectedStorage: {
                '/users': { list: [dataUser3], guid: 3 },
                '/users/3': dataUser3
              }
            }));
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () =>
            invokeTestHelper(IActionType.delete, schema.users.user.__stack, {
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
            }));
        });
      });

      describe('with a Resource descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () =>
            invokeTestHelper(IActionType.get, schema.rules.__stack, {
              seed: {
                '/rules': dataRules
              },
              expectedSignal: dataRules
            }));
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () =>
            invokeTestHelper(IActionType.create, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules,
              expectedStorage: {
                '/rules': dataRules
              }
            }));
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () =>
            invokeTestHelper(IActionType.update, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules,
              expectedStorage: {
                '/rules': dataRules
              }
            }));
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () =>
            invokeTestHelper(IActionType.delete, schema.rules.__stack, {
              seed: {
                '/rules': dataRules
              },
              expectedSignal: null,
              expectedStorage: {
              }
            }));
        });
      });
    });
  });
});
