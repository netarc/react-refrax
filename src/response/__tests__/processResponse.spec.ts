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
  mock_reset
} from 'test/TestSupport';

import { ResourceDescriptor } from '../../resource/descriptor';
import { processResponse } from '../../response/processResponse';
import { createSchemaCollection } from '../../schema/createSchemaCollection';
import { createSchema, Schema } from '../../schema/schema';
import { each } from '../../util/tools';
import { IActionType, IStatus } from '../../util/types';

// tslint:disable: no-empty no-magic-numbers

const dataCollectionUsers = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' }
];

describe('processResponse', () => {
  describe('when invoked', () => {
    describe('with invalid arguments', () => {
      it('should error with an invalid descriptor', () => {
        each([
          undefined, null, 123, 'foo', {}, () => {}
        ], (descriptor) => {
          expect(() => {
            processResponse(descriptor, {});
          }).to.throw(Error, 'processResponse: descriptor of type `ResourceDescriptor` expected');
        });
      });

      it('should error with an invalid handler', () => {
        each([123, 'foo'], (handler) => {
          expect(() => {
            processResponse(new ResourceDescriptor(null), {}, handler);
          }).to.throw(Error, 'processResponse: expected handler `Function`');
        });
      });
    });

    describe('with valid arguments', () => {
      let schema: Schema;
      let spy_defaultHandler: SinonSpy;

      beforeEach(() => {
        mock_reset();

        schema = createSchema();
        schema.addLeaf(createSchemaCollection('users'));

        spy_defaultHandler = spy(processResponse, 'defaultHandler');
      });

      afterEach(() => {
        spy_defaultHandler.restore();
      });

      it('should invoke default handler when none specified', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.get, schema.users.__stack);

        processResponse(descriptor, dataCollectionUsers);

        expect(spy_defaultHandler.callCount).to.equal(1);
        expect(spy_defaultHandler.getCall(0).args[0]).to.equal(descriptor);
        expect(spy_defaultHandler.getCall(0).args[1]).to.equal(dataCollectionUsers);
      });

      it('should invoke handler when specified', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.get, schema.users.__stack);
        const handler = spy();

        processResponse(descriptor, dataCollectionUsers, handler);

        expect(spy_defaultHandler.callCount).to.equal(0);
        expect(handler.callCount).to.equal(1);
        expect(handler.getCall(0).args[0]).to.equal(descriptor);
        expect(handler.getCall(0).args[1]).to.equal(dataCollectionUsers);
      });

      it('should translate action correctly to store', () => {
        const store = schema.__node.definition.storeMap.getOrCreate('user');
        const descriptor1 = new ResourceDescriptor(null, IActionType.get, schema.users.__stack);
        const descriptor2 = new ResourceDescriptor(null, IActionType.delete, schema.users.__stack);
        const options = { foo: 123 };

        spy(store, 'updateResource');
        spy(store, 'destroyResource');

        processResponse(descriptor1, dataCollectionUsers, null, options);

        expect(store.destroyResource.callCount).to.equal(0);
        expect(store.updateResource.callCount).to.equal(1);
        expect(store.updateResource.getCall(0).args[0]).to.equal(descriptor1);
        expect(store.updateResource.getCall(0).args[2]).to.equal(IStatus.complete);
        expect(store.updateResource.getCall(0).args[3]).to.equal(options);

        store.updateResource.reset();
        store.destroyResource.reset();

        processResponse(descriptor2, dataCollectionUsers, null, options);

        expect(store.destroyResource.callCount).to.equal(1);
        expect(store.updateResource.callCount).to.equal(0);
        expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor2);
        expect(store.destroyResource.getCall(0).args[1]).to.equal(options);
      });
    });
  });
});
