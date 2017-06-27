/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxOptions = require('RefraxOptions');
const RefraxParameters = require('RefraxParameters');
const RefraxPath = require('RefraxPath');
const RefraxQueryParameters = require('RefraxQueryParameters');
const RefraxSchema = require('RefraxSchema');
const RefraxSchemaPath = require('RefraxSchemaPath');
const createSchemaCollection = require('createSchemaCollection');
const createSchemaNamespace = require('createSchemaNamespace');
const createSchemaResource = require('createSchemaResource');
const RefraxConstants = require('RefraxConstants');
const ACTION_GET = RefraxConstants.action.get;
const ACTION_CREATE = RefraxConstants.action.create;
const ACTION_UPDATE = RefraxConstants.action.update;
const ACTION_DELETE = RefraxConstants.action.delete;
const STRATEGY_MERGE = RefraxConstants.strategy.merge;
const STRATEGY_REPLACE = RefraxConstants.strategy.replace;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const CLASSIFY_INVALID = RefraxConstants.classify.invalid;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const expect = chai.expect;


/* eslint-disable no-new */
describe('RefraxResourceDescriptor', () => {
  describe('instantiation', () => {
    describe('with no arguments', () => {
      it('should have correct shape default for GET', () => {
        const descriptor = new RefraxResourceDescriptor();

        expect(descriptor).to.deep.match({
          action: ACTION_GET,
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_RESOURCE,
          collectionStrategy: STRATEGY_REPLACE,
          event: 'change',
          fragments: [],
          id: null,
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
        const descriptor = new RefraxResourceDescriptor(ACTION_CREATE);

        expect(descriptor).to.deep.match({
          action: ACTION_CREATE,
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_RESOURCE,
          collectionStrategy: STRATEGY_MERGE,
          event: 'change',
          fragments: [],
          id: null,
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });

      it('should have correct shape for UPDATE', () => {
        const descriptor = new RefraxResourceDescriptor(ACTION_UPDATE);

        expect(descriptor).to.deep.match({
          action: ACTION_UPDATE,
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_RESOURCE,
          collectionStrategy: STRATEGY_REPLACE,
          event: 'change',
          fragments: [],
          id: null,
          params: {},
          partial: FRAGMENT_DEFAULT,
          payload: {},
          store: null,
          type: null,
          valid: true
        });
      });

      it('should have correct shape for DELETE', () => {
        const descriptor = new RefraxResourceDescriptor(ACTION_DELETE);

        expect(descriptor).to.deep.match({
          action: ACTION_DELETE,
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_RESOURCE,
          collectionStrategy: STRATEGY_REPLACE,
          event: 'change',
          fragments: [],
          id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack;
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          schema.api.addLeaf(createSchemaCollection('projects'));
          schema.api.projects.addLeaf(createSchemaNamespace('bar'));
          const stack = schema.api.projects.bar.__stack;
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.__stack;
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_COLLECTION,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['project'],
            type: 'project',
            valid: true,
            basePath: '/projects',
            path: '/projects'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaCollection('users'));
          const stack = schema.projects.project.users.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_COLLECTION,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
            params: { projectId: 123 },
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['user'],
            type: 'user',
            valid: true,
            basePath: '/projects/123/users',
            path: '/projects/123/users'
          });
        });
      });

      describe('SchemaNode(Item)', () => {
        it('should throw an error when provided no parameters', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.project.__stack;
          expect(() => {
            new RefraxResourceDescriptor(ACTION_GET, stack);
          }).to.throw(TypeError, 'Failed to map path: `/projects/:projectId`');
        });

        it('should have correct shape', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.project.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_ITEM,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change:123',
            fragments: [],
            id: 123,
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['project'],
            type: 'project',
            valid: true,
            basePath: '/projects/123',
            path: '/projects/123'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaCollection('users'));
          const stack = schema.projects.project.users.user.__stack.concat([
            new RefraxParameters({ projectId: 123, userId: 321 })
          ]);
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_ITEM,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change:321',
            fragments: [],
            id: 321,
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['user'],
            type: 'user',
            valid: true,
            basePath: '/projects/123/users/321',
            path: '/projects/123/users/321'
          });
        });
      });

      describe('SchemaNode(Resource)', () => {
        it('should have correct shape', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaResource('settings'));
          const stack = schema.settings.__stack;
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_RESOURCE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['setting'],
            type: 'setting',
            valid: true,
            basePath: '/settings',
            path: '/settings'
          });
        });

        it('should have correct shape when nested', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          schema.projects.project.addLeaf(createSchemaResource('settings'));
          const stack = schema.projects.project.settings.__stack.concat([
            new RefraxParameters({ projectId: 123 })
          ]);
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_RESOURCE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
            params: {},
            partial: FRAGMENT_DEFAULT,
            payload: {},
            store: schema.__storeMap.__map['setting'],
            type: 'setting',
            valid: true,
            basePath: '/projects/123/settings',
            path: '/projects/123/settings'
          });
        });
      });

      describe('QueryParams', () => {
        it('should have correct shape with numbers', () => {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: 123 }));
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: 'bar' }));
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat(new RefraxQueryParameters({ foo: [1, 'abc'] }));
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaNamespace('api'));
          const stack = schema.api.__stack.concat([
            new RefraxQueryParameters({ foo: 123 }),
            new RefraxQueryParameters({ bar: 'abc' }),
            new RefraxQueryParameters({ foo: [1, 2] })
          ]);
          const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

          expect(descriptor).to.deep.match({
            action: ACTION_GET,
            cacheStrategy: STRATEGY_REPLACE,
            classify: CLASSIFY_NAMESPACE,
            collectionStrategy: STRATEGY_REPLACE,
            event: 'change',
            fragments: [],
            id: null,
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
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar')
            );
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change',
              fragments: [],
              id: null,
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
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar'),
              new RefraxQueryParameters({ foo: 123 }),
              new RefraxPath('foo'),
            );
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change',
              fragments: [],
              id: null,
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
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar', true)
            );
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change',
              fragments: [],
              id: null,
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
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaNamespace('api'));
            const stack = schema.api.__stack.concat(
              new RefraxPath('bar', true),
              new RefraxQueryParameters({ foo: 123 })
            );
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change',
              fragments: [],
              id: null,
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
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaCollection('projects', {
              member: { paramId: 'pId' }
            }));
            const stack = schema.projects.project.__stack.concat([
              new RefraxParameters({ pId: 123 })
            ]);
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_ITEM,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change:123',
              fragments: [],
              id: 123,
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: schema.__storeMap.__map['project'],
              type: 'project',
              valid: true,
              basePath: '/projects/123',
              path: '/projects/123'
            });
          });

          it('should have correct shape when nested', () => {
            const schema = new RefraxSchema();
            schema.addLeaf(createSchemaCollection('projects', {
              member: { paramId: 'pId' }
            }));
            schema.projects.project.addLeaf(createSchemaCollection('users', {
              member: { paramId: 'uId' }
            }));
            const stack = schema.projects.project.users.user.__stack.concat([
              new RefraxParameters({ pId: 123, uId: 321 })
            ]);
            const descriptor = new RefraxResourceDescriptor(ACTION_GET, stack);

            expect(descriptor).to.deep.match({
              action: ACTION_GET,
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_ITEM,
              collectionStrategy: STRATEGY_REPLACE,
              event: 'change:321',
              fragments: [],
              id: 321,
              params: {},
              partial: FRAGMENT_DEFAULT,
              payload: {},
              store: schema.__storeMap.__map['user'],
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
        const descriptor = new RefraxResourceDescriptor(ACTION_GET, projects.__stack);

        expect(descriptor.store)
          .to.equal(RefraxResourceDescriptor.storeMap.getOrCreate(descriptor.type));
      });

      it('should use schema storeMap when using a Schema', () => {
        const schema = new RefraxSchema();
        schema.addLeaf(createSchemaCollection('projects'));
        const descriptor = new RefraxResourceDescriptor(ACTION_GET, schema.projects.__stack);

        expect(descriptor.store)
          .to.not.equal(RefraxResourceDescriptor.storeMap.getOrCreate(descriptor.type));
        expect(descriptor.store)
          .to.equal(schema.__storeMap.getOrCreate(descriptor.type));
      });
    });
  });
});
