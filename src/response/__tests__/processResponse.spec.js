/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import RefraxSchema from 'RefraxSchema';
import RefraxConstants from 'RefraxConstants';
import RefraxResourceDescriptor from 'RefraxResourceDescriptor';
import { each } from 'RefraxTools';
import createSchemaCollection from 'createSchemaCollection';
import processResponse from 'processResponse';

const ACTION_GET = RefraxConstants.action.get;
const ACTION_DELETE = RefraxConstants.action.delete;
const STATUS_COMPLETE = RefraxConstants.status.complete;

const dataCollectionUsers = [
  { id: 1, name: 'foo bob' },
  { id: 2, name: 'foo baz' }
];


/* global mock_reset */
/* eslint-disable no-new */
describe('processResponse', () => {
  describe('when invoked', () => {
    describe('with invalid arguments', () => {
      it('should error with an invalid descriptor', () => {
        each([
          undefined, null, 123, 'foo', {}, () => {}
        ], (descriptor) => {
          expect(function() {
            processResponse({}, descriptor);
          }).to.throw(TypeError, 'processResponse: descriptor of type `ResourceDescriptor` expected');
        });
      });

      it('should error with an invalid handler', () => {
        each([123, 'foo'], (handler) => {
          expect(function() {
            processResponse({}, new RefraxResourceDescriptor(null), handler);
          }).to.throw(TypeError, 'processResponse: expected handler `Function`');
        });
      });
    });

    describe('with valid arguments', () => {
      let schema;

      beforeEach(() => {
        mock_reset();

        schema = new RefraxSchema();
        schema.addLeaf(createSchemaCollection('users'));

        sinon.spy(processResponse, 'defaultHandler');
      });

      afterEach(() => {
        processResponse.defaultHandler.restore();
      });

      it('should invoke default handler when none specified', () => {
        const descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.users.__stack);

        processResponse(dataCollectionUsers, descriptor);

        expect(processResponse.defaultHandler.callCount).to.equal(1);
        expect(processResponse.defaultHandler.getCall(0).args[0]).to.equal(dataCollectionUsers);
        expect(processResponse.defaultHandler.getCall(0).args[1]).to.equal(descriptor);
      });

      it('should invoke handler when specified', () => {
        const descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.users.__stack);
        const handler = sinon.spy();

        processResponse(dataCollectionUsers, descriptor, handler);

        expect(processResponse.defaultHandler.callCount).to.equal(0);
        expect(handler.callCount).to.equal(1);
        expect(handler.getCall(0).args[0]).to.equal(dataCollectionUsers);
        expect(handler.getCall(0).args[1]).to.equal(descriptor);
      });

      it('should translate action correctly to store', () => {
        const store = schema.__node.definition.storeMap.getOrCreate('user');
        const descriptor1 = new RefraxResourceDescriptor(null, ACTION_GET, schema.users.__stack);
        const descriptor2 = new RefraxResourceDescriptor(null, ACTION_DELETE, schema.users.__stack);
        const options = { foo: 123 };

        sinon.spy(store, 'updateResource');
        sinon.spy(store, 'destroyResource');

        processResponse(dataCollectionUsers, descriptor1, options);

        expect(store.destroyResource.callCount).to.equal(0);
        expect(store.updateResource.callCount).to.equal(1);
        expect(store.updateResource.getCall(0).args[0]).to.equal(descriptor1);
        expect(store.updateResource.getCall(0).args[2]).to.equal(STATUS_COMPLETE);
        expect(store.updateResource.getCall(0).args[3]).to.equal(options);

        store.updateResource.reset();
        store.destroyResource.reset();

        processResponse(dataCollectionUsers, descriptor2, options);

        expect(store.destroyResource.callCount).to.equal(1);
        expect(store.updateResource.callCount).to.equal(0);
        expect(store.destroyResource.getCall(0).args[0]).to.equal(descriptor2);
        expect(store.destroyResource.getCall(0).args[1]).to.equal(options);
      });
    });
  });
});
