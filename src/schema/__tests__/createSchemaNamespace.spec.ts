/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { createSchemaNamespace } from '../../schema/createSchemaNamespace';
import { SchemaNode } from '../../schema/node';
import { SchemaPathClass } from '../../schema/path';
import { IClassification } from '../../util/types';

// tslint:disable no-magic-numbers no-empty

describe('createSchemaNamespace', () => {
  describe('invocation', () => {
    describe('with no arguments', () => {
      it('should throw an error', () => {
        expect(() => {
          // @ts-ignore
          createSchemaNamespace();
        }).to.throw(Error, 'expected string path identifier but found `undefined`');
      });
    });

    describe('with a path argument', () => {
      it('should throw an error when invalid', () => {
        expect(() => {
          // @ts-ignore
          createSchemaNamespace(123);
        }).to.throw(Error, 'expected string path identifier but found `123`');

        expect(() => {
          // @ts-ignore
          createSchemaNamespace(() => {});
        }).to.throw(Error, 'expected string path identifier but found `function () {}`');

        expect(() => {
          // @ts-ignore
          createSchemaNamespace({ foo: 123 });
        }).to.throw(Error, 'expected string path identifier but found `[object Object]`');
      });

      it('should look like a valid namespace', () => {
        const namespaceAPI = createSchemaNamespace('api');

        expect(namespaceAPI)
          .to.be.an.instanceof(SchemaPathClass)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(namespaceAPI.__node)
          .to.have.property('identifier', 'api');
        expect(namespaceAPI.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.namespace,
              path: 'api'
            });
      });
    });

    describe('with an options argument', () => {
      it('should pass options to namespace', () => {
        const namespaceAPI = createSchemaNamespace('api', {
          namespace: {
            path: 'barz'
          }
        });

        expect(namespaceAPI)
          .to.be.an.instanceof(SchemaPathClass)
          .to.have.property('__node')
            .that.is.instanceof(SchemaNode);
        expect(namespaceAPI.__node)
          .to.have.property('identifier', 'api');
        expect(namespaceAPI.__node)
          .to.have.property('definition')
            .that.deep.equals({
              classify: IClassification.namespace,
              path: 'barz'
            });
      });
    });
  });
});
