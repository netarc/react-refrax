/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { BaseResource } from '../../resource/base';
import { RefraxPath } from '../../resource/path';
import { createSchemaCollection } from '../../schema/createSchemaCollection';
import { SchemaPath } from '../../schema/path';
import { Schema } from '../../schema/schema';
import {
  RefraxOptions,
  RefraxParameters,
  RefraxQueryParameters
} from '../../util/composableHash';
import { IActionType, TStackItem } from '../../util/types';

// tslint:disable: no-unused-expression no-empty no-magic-numbers

describe('BaseResource', () => {
  let schema: Schema;

  beforeEach(() => {
    schema = new Schema();

    schema.addLeaf(createSchemaCollection('users'));
  });

  describe('instantiation', () => {
    it('should require a valid accessor', () => {
      expect(() => {
        // @ts-ignore
        new BaseResource();
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new BaseResource(123);
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new BaseResource('foo');
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new BaseResource({ foo: 'bar' });
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new BaseResource(() => {});
      }).to.throw(Error, 'BaseResource expected valid SchemaPath');

      expect(() => {
        // @ts-ignore
        new BaseResource(schema.users);
      }).to.not.throw(Error);
    });

    it('should look like a ResourceBase', () => {
      const resource = new BaseResource(schema.users);

      expect(resource)
        .to.be.instanceof(BaseResource);
      expect(resource)
        .to.have.property('_schemaPath')
          .that.is.an.instanceof(SchemaPath);
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
        const resource = new BaseResource(
          schema.users,
          new RefraxQueryParameters({ queryFoo: 123 }),
          new RefraxParameters({ paramFoo: 321 }),
          new RefraxOptions({ optionFoo: 111 }),
          'pathFoo'
        );

        expect(resource._generateStack())
          .to.deep.equal(([] as TStackItem[]).concat(
            schema.users.__stack,
            new RefraxPath('pathFoo'),
            new RefraxParameters({ paramFoo: 321 }),
            new RefraxQueryParameters({ queryFoo: 123 }),
            new RefraxOptions({ optionFoo: 111 })
          ));
      });
    });

    describe('_generateDescriptor', () => {
      describe('invoked with no arguments', () => {
        it('generates a descriptor with a default action ', () => {
          const resource = new BaseResource(schema.users);
          const descriptor = resource._generateDescriptor(IActionType.get);

          expect(descriptor.action).to.equal(IActionType.get);
        });
      });

      describe('invoked with an action', () => {
        it('generates a descriptor using that action ', () => {
          const resource = new BaseResource(schema.users);
          const descriptor = resource._generateDescriptor(IActionType.create);

          expect(descriptor.action).to.equal(IActionType.create);
        });
      });
    });
  });
});
