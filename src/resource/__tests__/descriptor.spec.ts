/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { ResourceDescriptor } from 'resource/descriptor';
import { RefraxPath } from 'resource/path';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { createSchemaNamespace } from 'schema/createSchemaNamespace';
import { createSchemaResource } from 'schema/createSchemaResource';
import { Schema } from 'schema/schema';
import { RefraxParameters, RefraxQueryParameters } from 'util/composableHash';
import RefraxConfig from 'util/config';
import { IActionType, IClassification, IStrategy } from 'util/types';

// tslint:disable: no-string-literal no-magic-numbers

const FRAGMENT_DEFAULT = RefraxConfig.defaultFragment;

describe('resourceDescriptor', () => {
  describe('instantiation', () => {
    describe('with no arguments', () => {
      it('should have correct shape default for GET', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.get);

        expect(descriptor).to.deep.match({
          action: IActionType.get,
          cacheStrategy: IStrategy.replace,
          classify: IClassification.resource,
          collectionStrategy: IStrategy.replace,
          event: 'change',
          fragments: [],
          id: null,
          navPath: '',
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });
    });

    describe('with just an action argument', () => {
      it('should have correct shape for CREATE', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.create);

        expect(descriptor).to.deep.match({
          action: IActionType.create,
          cacheStrategy: IStrategy.replace,
          classify: IClassification.resource,
          collectionStrategy: IStrategy.merge,
          event: 'change',
          fragments: [],
          id: null,
          navPath: '',
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });

      it('should have correct shape for UPDATE', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.update);

        expect(descriptor).to.deep.match({
          action: IActionType.update,
          cacheStrategy: IStrategy.replace,
          classify: IClassification.resource,
          collectionStrategy: IStrategy.replace,
          event: 'change',
          fragments: [],
          id: null,
          navPath: '',
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });

      it('should have correct shape for DELETE', () => {
        const descriptor = new ResourceDescriptor(null, IActionType.delete);

        expect(descriptor).to.deep.match({
          action: IActionType.delete,
          cacheStrategy: IStrategy.replace,
          classify: IClassification.resource,
          collectionStrategy: IStrategy.replace,
          event: 'change',
          fragments: [],
          id: null,
          navPath: '',
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });
    });

    describe('with a stack argument', () => {
      describe('SchemaNode(Namespace)', () => {
        it('should have correct shape', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack;
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api',
            fragments: [],
            id: null,
            navPath: '.api',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api',
            path: '/api'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          schema.api.addLeaf(createSchemaCollection('projects'));
          schema.api.projects.addLeaf(createSchemaNamespace('bar'));
          const stack = schema.api.projects.bar.__stack;
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api/projects/bar',
            fragments: [],
            id: null,
            navPath: '.api.projects.bar',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api/projects/bar',
            path: '/api/projects/bar'
          });
        });
      });

      describe('SchemaNode(Collection)', () => {
        it('should have correct shape', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.__stack;
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.collection,
            collectionStrategy: IStrategy.replace,
            event: '/projects',
            fragments: [],
            id: null,
            navPath: '.projects',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['project'],
            type: 'project',
            valid: true,
            basePath: '/projects',
            path: '/projects'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaCollection('users'));
          const stack = schema.projects.project.users.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.collection,
            collectionStrategy: IStrategy.replace,
            event: '/projects/123/users',
            fragments: [],
            id: null,
            navPath: '.projects.project.users',
            params: { projectId: 123 },
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['user'],
            type: 'user',
            valid: true,
            basePath: '/projects/123/users',
            path: '/projects/123/users'
          });
        });
      });

      describe('SchemaNode(Item)', () => {
        it('should throw an error when provided no parameters', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.project.__stack;
          expect(() => {
            // tslint:disable-next-line no-unused-expression
            new ResourceDescriptor(null, IActionType.get, stack);
          }).to.throw(Error, 'Failed to map path: `/projects/:projectId`');
        });

        it('should have correct shape', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.project.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.item,
            collectionStrategy: IStrategy.replace,
            event: '123',
            fragments: [],
            id: '123',
            navPath: '.projects.project',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['project'],
            type: 'project',
            valid: true,
            basePath: '/projects/123',
            path: '/projects/123'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaCollection('users'));
          const stack = schema.projects.project.users.user.__stack.concat([
            new RefraxParameters({ projectId: 123, userId: 321 })
          ]);
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.item,
            collectionStrategy: IStrategy.replace,
            event: '321',
            fragments: [],
            id: '321',
            navPath: '.projects.project.users.user',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['user'],
            type: 'user',
            valid: true,
            basePath: '/projects/123/users/321',
            path: '/projects/123/users/321'
          });
        });
      });

      describe('SchemaNode(Resource)', () => {
        it('should have correct shape', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaResource('settings'));
          const stack = schema.settings.__stack;
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.resource,
            collectionStrategy: IStrategy.replace,
            event: '/settings',
            fragments: [],
            id: null,
            navPath: '.settings',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['setting'],
            type: 'setting',
            valid: true,
            basePath: '/settings',
            path: '/settings'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaResource('settings'));
          const stack = schema.projects.project.settings.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.resource,
            collectionStrategy: IStrategy.replace,
            event: '/projects/123/settings',
            fragments: [],
            id: null,
            navPath: '.projects.project.settings',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__node.definition.storeMap.__map['setting'],
            type: 'setting',
            valid: true,
            basePath: '/projects/123/settings',
            path: '/projects/123/settings'
          });
        });
      });

      describe('QueryParams', () => {
        it('should have correct shape with numbers', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: 123 }));
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api?foo=123',
            fragments: [],
            id: null,
            navPath: '.api',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api?foo=123',
            path: '/api?foo=123'
          });
        });

        it('should have correct shape with strings', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: 'bar' }));
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api?foo=bar',
            fragments: [],
            id: null,
            navPath: '.api',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api?foo=bar',
            path: '/api?foo=bar'
          });
        });

        it('should have correct shape with arrays', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: [1, 'abc'] }));
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api?foo[]=1&foo[]=abc',
            fragments: [],
            id: null,
            navPath: '.api',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api?foo[]=1&foo[]=abc',
            path: '/api?foo[]=1&foo[]=abc'
          });
        });

        it('should have correct shape when mixed', () => {
          const schema = new Schema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat([
            new RefraxQueryParameters({ foo: 123 }),
            new RefraxQueryParameters({ bar: 'abc' }),
            new RefraxQueryParameters({ foo: [1, 2] })
          ]);
          const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

          expect(descriptor).to.deep.match({
            action: IActionType.get,
            cacheStrategy: IStrategy.replace,
            classify: IClassification.namespace,
            collectionStrategy: IStrategy.replace,
            event: '/api?foo[]=1&foo[]=2&bar=abc',
            fragments: [],
            id: null,
            navPath: '.api',
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: null,
            type: null,
            valid: true,
            basePath: '/api?foo[]=1&foo[]=2&bar=abc',
            path: '/api?foo[]=1&foo[]=2&bar=abc'
          });
        });
      });

      describe('Path', () => {
        describe('when not a modifier', () => {
          it('should have correct shape', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar')
            );
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api/bar',
              fragments: [],
              id: null,
              navPath: '.api',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: null,
              type: null,
              valid: true,
              basePath: '/api/bar',
              path: '/api/bar'
            });
          });

          it('should have correct shape when nested', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar'),
              new RefraxQueryParameters({ foo: 123 }),
              new RefraxPath('foo')
            );
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api/bar/foo?foo=123',
              fragments: [],
              id: null,
              navPath: '.api',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: null,
              type: null,
              valid: true,
              basePath: '/api/bar/foo?foo=123',
              path: '/api/bar/foo?foo=123'
            });
          });
        });

        describe('when a modifier', () => {
          it('should have correct shape', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar', true)
            );
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api',
              fragments: [],
              id: null,
              navPath: '.api',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: null,
              type: null,
              valid: true,
              basePath: '/api',
              path: '/api/bar'
            });
          });

          it('should have correct shape when nested', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar', true),
              new RefraxQueryParameters({ foo: 123 })
            );
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api?foo=123',
              fragments: [],
              id: null,
              navPath: '.api',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: null,
              type: null,
              valid: true,
              basePath: '/api?foo=123',
              path: '/api/bar?foo=123'
            });
          });
        });
      });

      describe('Options', () => {
        describe('paramId', () => {
          it('should have correct shape', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaCollection('projects', {
              member: { paramId: 'pId' }
            }));
            const stack = schema.projects.project.__stack.concat([
              new RefraxParameters({ pId: 123 })
            ]);
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.item,
              collectionStrategy: IStrategy.replace,
              event: '123',
              fragments: [],
              id: '123',
              navPath: '.projects.project',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: schema.__node.definition.storeMap.__map['project'],
              type: 'project',
              valid: true,
              basePath: '/projects/123',
              path: '/projects/123'
            });
          });

          it('should have correct shape when nested', () => {
            const schema = new Schema();
            schema.addLeaf(createSchemaCollection('projects', {
              member: { paramId: 'pId' }
            }));
            schema.projects.project.addLeaf(createSchemaCollection('users', {
              member: { paramId: 'uId' }
            }));
            const stack = schema.projects.project.users.user.__stack.concat([
              new RefraxParameters({ pId: 123, uId: 321 })
            ]);
            const descriptor = new ResourceDescriptor(null, IActionType.get, stack);

            expect(descriptor).to.deep.match({
              action: IActionType.get,
              cacheStrategy: IStrategy.replace,
              classify: IClassification.item,
              collectionStrategy: IStrategy.replace,
              event: '321',
              fragments: [],
              id: '321',
              navPath: '.projects.project.users.user',
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: schema.__node.definition.storeMap.__map['user'],
              type: 'user',
              valid: true,
              basePath: '/projects/123/users/321',
              path: '/projects/123/users/321'
            });
          });
        });
      });
    });

    describe('resolves storeMap', () => {
      it('should use default global storeMap when not using a Schema', () => {
        const projects = createSchemaCollection('projects');
        const descriptor = new ResourceDescriptor(null, IActionType.get, projects.__stack);

        expect(descriptor.store)
          .to.equal(ResourceDescriptor.storeMap.getOrCreate(descriptor.type!));
      });

      it('should use schema storeMap when using a Schema', () => {
        const schema = new Schema();
        schema.addLeaf(createSchemaCollection('projects'));
        const descriptor = new ResourceDescriptor(null, IActionType.get, schema.projects.__stack);

        expect(descriptor.store)
          .to.not.equal(ResourceDescriptor.storeMap.getOrCreate(descriptor.type!));
        expect(descriptor.store)
          .to.equal(schema.__node.definition.storeMap.getOrCreate(descriptor.type));
      });
    });
  });
});
