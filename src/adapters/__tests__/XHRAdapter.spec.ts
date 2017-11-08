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
  mock_delete,
  mock_get,
  mock_post,
  mock_put,
  mock_reset
} from 'test/TestSupport';

import { ResourceDescriptor } from 'resource/descriptor';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { createSchemaResource } from 'schema/createSchemaResource';
import { Schema } from 'schema/schema';
import { Store } from 'store/store';
import { RefraxParameters } from 'util/composableHash';
import { IActionType, IKeyValue, TStackItem } from 'util/types';
import { XHRAdapter } from '../XHR';

// tslint:disable: no-magic-numbers

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

describe('XHRAdapter', () => {
  let schema: Schema;
  let storeUsers: Store;
  let storeRules: Store;
  let adapter: XHRAdapter;
  let spyUsers_touchResource: SinonSpy;
  let spyUsers_updateResource: SinonSpy;
  let spyRules_touchResource: SinonSpy;
  let spyRules_updateResource: SinonSpy;

  beforeEach(() => {
    mock_reset();

    adapter = new XHRAdapter();
    schema = new Schema({ adapter });
    schema.addLeaf(createSchemaCollection('users'));
    schema.addLeaf(createSchemaResource('rules'));

    storeUsers = schema.__node.definition.storeMap.getOrCreate('user');
    spyUsers_touchResource = spy(storeUsers, 'touchResource');
    spyUsers_updateResource = spy(storeUsers, 'updateResource');

    storeRules = schema.__node.definition.storeMap.getOrCreate('rule');
    spyRules_touchResource = spy(storeRules, 'touchResource');
    spyRules_updateResource = spy(storeRules, 'updateResource');
  });

  describe('instantiation', () => {
    it('should not accept invalid arguments', () => {
      expect(() => {
        // @ts-ignore
        new XHRAdapter(123);
      }).to.throw(Error, 'attempting to pass an invalid config of type');

      expect(() => {
        // @ts-ignore
        new XHRAdapter(() => {});
      }).to.throw(Error, 'attempting to pass an invalid config of type');

      expect(() => {
        // @ts-ignore
        new XHRAdapter('foo');
      }).to.throw(Error, 'attempting to pass an invalid config of type');
    });

    it('should accept valid arguments', () => {
      expect(() => {
        // @ts-ignore
        new XHRAdapter();
      }).to.not.throw(Error);

      expect(() => {
        // @ts-ignore
        new XHRAdapter({ foo: 123 });
      }).to.not.throw(Error);
    });
  });

  describe('methods', () => {
    describe('invoke', () => {
      const invokeTestHelper = (action: IActionType, stack: TStackItem[], options: any) => {
        const {
          params,
          payload,
          expectedSignal
        }: { params: IKeyValue; payload: any; expectedSignal: any } = options;

        stack = ([] as TStackItem[]).concat(stack, new RefraxParameters(params));
        const descriptor = new ResourceDescriptor(null, action, stack);
        descriptor.payload = payload;

        const promise = adapter.invoke(descriptor);

        expect(promise).to.be.instanceof(Promise);

        return promise
          .then((result) => {
            expect(spyUsers_touchResource.callCount).to.equal(descriptor.store === storeUsers ? 1 : 0);
            expect(spyUsers_updateResource.callCount).to.equal(0);
            expect(spyRules_touchResource.callCount).to.equal(descriptor.store === storeRules ? 1 : 0);
            expect(spyRules_updateResource.callCount).to.equal(0);
            expect(result).to.be.a('array');
            expect(result.length).to.equal(3);
            expect(result[0]).to.deep.equal(expectedSignal);

            if (descriptor.action === IActionType.delete) {
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
          // @ts-ignore
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
          it('should correctly fetch', () => {
            mock_get('/users', dataCollectionUsers);

            return invokeTestHelper(IActionType.get, schema.users.__stack, {
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

            return invokeTestHelper(IActionType.create, schema.users.__stack, {
              payload: { name: expected.name },
              expectedSignal: expected
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/users', [dataUser3]);

            return invokeTestHelper(IActionType.update, schema.users.__stack, {
              payload: [dataUser3],
              expectedSignal: [dataUser3]
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/users');

            return invokeTestHelper(IActionType.delete, schema.users.__stack, {
              expectedSignal: null
            });
          });
        });
      });

      describe('with a Collection Item descriptor', () => {
        describe('using action GET', () => {
          it('should correctly fetch', () => {
            mock_get('/users/1', dataUser1);

            return invokeTestHelper(IActionType.get, schema.users.user.__stack, {
              params: { userId: 1 },
              expectedSignal: dataUser1
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            mock_post('/users/3', dataUser3);

            return invokeTestHelper(IActionType.create, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/users/3', dataUser3);

            return invokeTestHelper(IActionType.update, schema.users.user.__stack, {
              params: { userId: 3 },
              payload: dataUser3,
              expectedSignal: dataUser3
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/users/2');

            return invokeTestHelper(IActionType.delete, schema.users.user.__stack, {
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

            return invokeTestHelper(IActionType.get, schema.rules.__stack, {
              expectedSignal: dataRules
            });
          });
        });

        describe('using action CREATE', () => {
          it('should correctly create entries', () => {
            mock_post('/rules', dataRules);

            return invokeTestHelper(IActionType.create, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules
            });
          });
        });

        describe('using action UPDATE', () => {
          it('should correctly update entries', () => {
            mock_put('/rules', dataRules);

            return invokeTestHelper(IActionType.update, schema.rules.__stack, {
              payload: dataRules,
              expectedSignal: dataRules
            });
          });
        });

        describe('using action DELETE', () => {
          it('should correctly remove entries', () => {
            mock_delete('/rules');

            return invokeTestHelper(IActionType.delete, schema.rules.__stack, {
              expectedSignal: null
            });
          });
        });
      });
    });
  });
});
