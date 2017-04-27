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
describe('RefraxResourceDescriptor', function() {
  describe('instantiation', function() {
    describe('with no arguments', function() {
      it('should have correct shape default for GET', function() {
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

    describe('with just an action argument', function() {
      it('should have correct shape for CREATE', function() {
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

      it('should have correct shape for UPDATE', function() {
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

      it('should have correct shape for DELETE', function() {
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

    describe('with a stack argument', function() {
      describe('SchemaNode(Namespace)', function() {
        it('should have correct shape', function() {
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

        it('should have correct shape when nested', function() {
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

      describe('SchemaNode(Collection)', function() {
        it('should have correct shape', function() {
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

        it('should have correct shape when nested', function() {
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

      describe('SchemaNode(Item)', function() {
        it('should throw an error when provided no parameters', function() {
          const schema = new RefraxSchema();
          schema.addLeaf(createSchemaCollection('projects'));
          const stack = schema.projects.project.__stack;
          expect(function() {
            new RefraxResourceDescriptor(ACTION_GET, stack);
          }).to.throw(TypeError, 'Failed to map path: `/projects/:projectId`');
        });

        it('should have correct shape', function() {
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

        it('should have correct shape when nested', function() {
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

      describe('SchemaNode(Resource)', function() {
        it('should have correct shape', function() {
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

        it('should have correct shape when nested', function() {
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

      describe('QueryParams', function() {
        it('should have correct shape with numbers', function() {
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

        it('should have correct shape with strings', function() {
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

        it('should have correct shape with arrays', function() {
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

        it('should have correct shape when mixed', function() {
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

      describe('Path', function() {
        describe('when not a modifier', function() {
          it('should have correct shape', function() {
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

          it('should have correct shape when nested', function() {
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

        describe('when a modifier', function() {
          it('should have correct shape', function() {
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

          it('should have correct shape when nested', function() {
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

      describe('Options', function() {
        describe('paramId', function() {
          it('should have correct shape', function() {
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

          it('should have correct shape when nested', function() {
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
  });
});
