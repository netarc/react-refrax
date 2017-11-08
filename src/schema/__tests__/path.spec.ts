/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { spy } from 'sinon';

import { ResourceDescriptor } from 'resource/descriptor';
import { createSchemaCollection } from 'schema/createSchemaCollection';
import { createSchemaNamespace } from 'schema/createSchemaNamespace';
import { SchemaNode } from 'schema/node';
import { SchemaPath } from 'schema/path';
import { Schema } from 'schema/schema';
import { RefraxParameters } from 'util/composableHash';
import RefraxConfig from 'util/config';
import {
  IActionType,
  IClassification,
  IStatus,
  IStrategy,
  TStackItem
} from 'util/types';

// tslint:disable: no-unused-expression no-magic-numbers no-string-literal object-literal-shorthand

const FRAGMENT_DEFAULT = RefraxConfig.defaultFragment;

const dataCollectionProjects = [
  { id: 1, name: 'project 1' },
  { id: 2, name: 'project 2' }
];

const dataCollectionUsers = [
  { id: 1, name: 'user bob' },
  { id: 2, name: 'user sue' }
];

describe('SchemaPath', () => {
  describe('instantiation', () => {
    it('should throw an error when passed invalid arguments', () => {
      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaPath();
      }).to.throw(Error, 'Expected node of type SchemaNode but found');

      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaPath(123);
      }).to.throw(Error, 'Expected node of type SchemaNode but found');

      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaPath('foo');
      }).to.throw(Error, 'Expected node of type SchemaNode but found');

      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaPath({ bar: 23 });
      }).to.throw(Error, 'Expected node of type SchemaNode but found');
    });

    it('should not throw an error when passed valid arguments', () => {
      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaPath(new SchemaNode());
      }).to.not.throw(Error);
    });
  });

  describe('methods', () => {
    describe('enumerateLeafs', () => {
      it('should only enumerate shallow leafs', () => {
        const nodeAccessor = new SchemaPath(new SchemaNode());
        const schemaNode = new SchemaNode();
        const schemaNodeWithLiteral = new SchemaNode(IClassification.namespace, 'foo');
        const schemaNodeNested = new SchemaNode();
        const keys: string[] = [];
        const accessorNodes: SchemaNode[] = [];

        nodeAccessor.addLeaf('bar', schemaNode);
        nodeAccessor.addLeaf(schemaNodeWithLiteral);
        nodeAccessor.bar.addLeaf('baz', schemaNodeNested);

        nodeAccessor.enumerateLeafs((key, accessor) => {
          keys.push(key);
          accessorNodes.push(accessor.__node);
        });

        expect(keys).to.deep.equal(['bar', 'foo']);
        expect(accessorNodes[0]).to.equal(schemaNode);
        expect(accessorNodes[1]).to.equal(schemaNodeWithLiteral);
      });
    });

    describe('addLeaf', () => {
      it('should only accept a leaf object optionally preceeded by an identifier', () => {
        const nodeAccessor = new SchemaPath(new SchemaNode());
        const schemaNode = new SchemaNode();

        expect(() => {
        // @ts-ignore - invalid argument
        nodeAccessor.addLeaf(123);
        }).to.throw(Error, 'Expected leaf of type SchemaPath or SchemaNode');

        expect(() => {
        // @ts-ignore - invalid argument
        nodeAccessor.addLeaf('abc');
        }).to.throw(Error, 'Expected leaf of type SchemaPath or SchemaNode');

        expect(() => {
        // @ts-ignore - invalid argument
        nodeAccessor.addLeaf('abc', {});
        }).to.throw(Error, 'Expected leaf of type SchemaPath or SchemaNode');

        expect(() => {
        // @ts-ignore - invalid argument
        nodeAccessor.addLeaf(schemaNode);
        }).to.throw(Error, 'Failed to add leaf with no inherit identifier');
      });

      it('should not throw an error on valid arguments', () => {
        const nodeAccessor = new SchemaPath(new SchemaNode());
        const schemaNode = new SchemaNode();
        const schemaNodeWithLiteral = new SchemaNode(IClassification.namespace, 'foo');

        expect(() => {
          nodeAccessor.addLeaf('bar', schemaNode);
          nodeAccessor.addLeaf(schemaNodeWithLiteral);
        }).to.not.throw(Error);
      });

      it('should correctly add an accessible leaf', () => {
        const rootAccessor = new SchemaPath(new SchemaNode());
        const schemaNode1 = new SchemaNode();
        const schemaNode2 = new SchemaNode();

        rootAccessor.addLeaf('foo', schemaNode1);
        expect(rootAccessor).to.have.property('foo')
          .that.is.an.instanceof(SchemaPath);
        expect(rootAccessor.foo.__node).to.equal(schemaNode1);

        rootAccessor.foo.addLeaf('bar', schemaNode2);
        expect(rootAccessor).to.not.have.property('bar');
        expect(rootAccessor.foo).to.have.property('bar')
          .that.is.an.instanceof(SchemaPath);
        expect(rootAccessor.foo.bar.__node).to.equal(schemaNode2);

        expect(rootAccessor.foo.bar).to.not.have.property('foo');
      });
    });

    describe(IActionType.inspect, () => {
      it('should correctly describe hierarchy', () => {
        const schema = new Schema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));

        expect(schema.inspect())
          .to.deep.match({
            '/api': {
              action: IActionType.inspect,
              basePath: '/api',
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api',
              fragments: [],
              id: null,
              params: {},
              partial: FRAGMENT_DEFAULT,
              path: '/api',
              payload: {},
              store: null,
              type: null,
              valid: true
            },
            '/api/projects': {
              action: IActionType.inspect,
              basePath: '/api/projects',
              cacheStrategy: IStrategy.replace,
              classify: IClassification.collection,
              collectionStrategy: IStrategy.replace,
              event: '/api/projects',
              fragments: [],
              id: null,
              params: {},
              partial: FRAGMENT_DEFAULT,
              path: '/api/projects',
              payload: {},
              store: schema.__node.definition.storeMap.__map['project'],
              type: 'project',
              valid: true
            },
            '/api/projects/:projectId': {
              action: IActionType.inspect,
              basePath: '/api/projects/:projectId',
              cacheStrategy: IStrategy.replace,
              classify: IClassification.item,
              collectionStrategy: IStrategy.replace,
              event: '/api/projects/:projectId',
              fragments: [],
              id: null,
              params: {},
              partial: FRAGMENT_DEFAULT,
              path: '/api/projects/:projectId',
              payload: {},
              store: schema.__node.definition.storeMap.__map['project'],
              type: 'project',
              valid: false
            },
            '/api/projects/bar': {
              action: IActionType.inspect,
              basePath: '/api/projects/bar',
              cacheStrategy: IStrategy.replace,
              classify: IClassification.namespace,
              collectionStrategy: IStrategy.replace,
              event: '/api/projects/bar',
              fragments: [],
              id: null,
              params: {},
              partial: FRAGMENT_DEFAULT,
              path: '/api/projects/bar',
              payload: {},
              store: null,
              type: null,
              valid: true
            }
          });
      });
    });

    describe('invalidate', () => {
      let schema: Schema;

      beforeEach(() => {
        let descriptor;

        schema = new Schema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));
        schema.api.projects.project.addLeaf(createSchemaCollection('users'));

        descriptor = new ResourceDescriptor(null, IActionType.get, schema.api.projects.__stack);
        descriptor.store!.updateResource(descriptor, dataCollectionProjects, IStatus.complete);

        descriptor = new ResourceDescriptor(null, IActionType.get, ([] as TStackItem[]).concat(
          schema.api.projects.project.users.__stack,
          new RefraxParameters({ projectId: 1 })
        ));
        descriptor.store!.updateResource(descriptor, dataCollectionUsers, IStatus.complete);
      });

      it('should correctly invoke store invalidate', () => {
        const storeProject = schema.__node.definition.storeMap.__map['project'];
        const storeUser = schema.__node.definition.storeMap.__map['user'];

        spy(storeProject, 'invalidate');
        spy(storeUser, 'invalidate');

        schema.api.projects.invalidate();

        expect(storeProject.invalidate.callCount).to.equal(1);
        expect(storeUser.invalidate.callCount).to.equal(0);
        expect(storeProject.invalidate.getCall(0).args[0]).to.deep.match({
          action: IActionType.get,
          basePath: '/api/projects',
          cacheStrategy: IStrategy.replace,
          classify: IClassification.collection,
          collectionStrategy: IStrategy.replace,
          event: '/api/projects',
          fragments: [],
          id: null,
          params: {},
          partial: FRAGMENT_DEFAULT,
          path: '/api/projects',
          payload: {},
          store: storeProject,
          type: 'project',
          valid: true
        });
        expect(storeProject.invalidate.getCall(0).args[1]).to.deep.equal({});
      });

      it('should correctly pass parameters and query params', () => {
        const store = schema.__node.definition.storeMap.__map['project'];

        spy(store, 'invalidate');

        schema.api.projects
          .withParams({ foo: 123 })
          .withQueryParams({ bar: 321 })
          .invalidate();

        expect(store.invalidate.callCount).to.equal(1);
        expect(store.invalidate.getCall(0).args[0]).to.deep.match({
          action: IActionType.get,
          basePath: '/api/projects?bar=321',
          cacheStrategy: IStrategy.replace,
          classify: IClassification.collection,
          collectionStrategy: IStrategy.replace,
          event: '/api/projects?bar=321',
          fragments: [],
          id: null,
          params: { foo: 123 },
          partial: FRAGMENT_DEFAULT,
          path: '/api/projects?bar=321',
          payload: {},
          store: store,
          type: 'project',
          valid: true
        });
        expect(store.invalidate.getCall(0).args[1]).to.deep.equal({});
      });

      it('should correctly pass options', () => {
        const store = schema.__node.definition.storeMap.__map['project'];

        spy(store, 'invalidate');

        schema.api.projects.invalidate({ noNotify: true });

        expect(store.invalidate.getCall(0).args[1]).to.deep.equal({ noNotify: true });
      });

      describe('with option cascade', () => {
        it('should correctly enumerate leafs and invalidate', () => {
          const storeProject = schema.__node.definition.storeMap.__map['project'];
          const storeUser = schema.__node.definition.storeMap.__map['user'];

          spy(storeProject, 'invalidate');
          spy(storeUser, 'invalidate');

          schema.api.projects.withParams({ projectId: 123 }).invalidate({ cascade: true });

          expect(storeProject.invalidate.callCount).to.equal(2);
          expect(storeUser.invalidate.callCount).to.equal(1);
          expect(storeProject.invalidate.getCall(0).args[1]).to.deep.equal({ cascade: true });
          expect(storeProject.invalidate.getCall(1).args[1]).to.deep.equal({ cascade: true });
          expect(storeUser.invalidate.getCall(0).args[1]).to.deep.equal({ cascade: true });
        });

        it('should correctly skip invalid descriptors', () => {
          const storeProject = schema.__node.definition.storeMap.__map['project'];
          const storeUser = schema.__node.definition.storeMap.__map['user'];

          spy(storeProject, 'invalidate');
          spy(storeUser, 'invalidate');

          schema.api.projects.invalidate({ cascade: true });

          expect(storeProject.invalidate.callCount).to.equal(1);
          expect(storeUser.invalidate.callCount).to.equal(0);
          expect(storeProject.invalidate.getCall(0).args[1]).to.deep.equal({ cascade: true });
        });
      });
    });

    describe('invalidateLeafs', () => {
      let schema: Schema;

      beforeEach(() => {
        let descriptor;

        schema = new Schema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));
        schema.api.projects.project.addLeaf(createSchemaCollection('users'));

        descriptor = new ResourceDescriptor(null, IActionType.get, schema.api.projects.__stack);
        descriptor.store!.updateResource(descriptor, dataCollectionProjects, IStatus.complete);

        descriptor = new ResourceDescriptor(null, IActionType.get, ([] as TStackItem[]).concat(
          schema.api.projects.project.users.__stack,
          new RefraxParameters({ projectId: 1 })
        ));
        descriptor.store!.updateResource(descriptor, dataCollectionUsers, IStatus.complete);
      });

      it('should correctly invoke store invalidate', () => {
        const storeProject = schema.__node.definition.storeMap.__map['project'];
        const storeUser = schema.__node.definition.storeMap.__map['user'];

        spy(storeProject, 'invalidate');
        spy(storeUser, 'invalidate');

        schema.api.projects.withParams({ projectId: 123 }).invalidateLeafs();

        expect(storeProject.invalidate.callCount).to.equal(1);
        expect(storeUser.invalidate.callCount).to.equal(0);
        expect(storeProject.invalidate.getCall(0).args[0]).to.deep.match({
          action: IActionType.get,
          basePath: '/api/projects/123',
          cacheStrategy: IStrategy.replace,
          classify: IClassification.item,
          collectionStrategy: IStrategy.replace,
          event: '123',
          fragments: [],
          id: '123',
          params: { projectId: 123 },
          partial: FRAGMENT_DEFAULT,
          path: '/api/projects/123',
          payload: {},
          store: storeProject,
          type: 'project',
          valid: true
        });
        expect(storeProject.invalidate.getCall(0).args[1]).to.deep.equal({});
      });

      it('should correctly pass parameters and query params', () => {
        const store = schema.__node.definition.storeMap.__map['project'];

        spy(store, 'invalidate');

        schema.api.projects
          .withParams({ projectId: 123 })
          .withQueryParams({ bar: 321 })
          .invalidateLeafs();

        expect(store.invalidate.callCount).to.equal(1);
        expect(store.invalidate.getCall(0).args[0]).to.deep.match({
          action: IActionType.get,
          basePath: '/api/projects/123?bar=321',
          cacheStrategy: IStrategy.replace,
          classify: IClassification.item,
          collectionStrategy: IStrategy.replace,
          event: '123',
          fragments: [],
          id: '123',
          params: { projectId: 123 },
          partial: FRAGMENT_DEFAULT,
          path: '/api/projects/123?bar=321',
          payload: {},
          store: store,
          type: 'project',
          valid: true
        });
        expect(store.invalidate.getCall(0).args[1]).to.deep.equal({});
      });

      it('should correctly pass options', () => {
        const store = schema.__node.definition.storeMap.__map['project'];

        spy(store, 'invalidate');

        schema.api.projects
          .withParams({ projectId: 123 })
          .invalidateLeafs({ noNotify: true });

        expect(store.invalidate.getCall(0).args[1]).to.deep.equal({ noNotify: true });
      });
    });
  });

  describe('behavior', () => {
    describe('detached', () => {
      it('should not circular reference', () => {
        const schema = new Schema();
        const projects = createSchemaCollection('projects');
        const users = createSchemaCollection('users');

        schema.addLeaf(projects);
        schema.projects.project.addDetachedLeaf(users);
        users.user.addLeaf(projects);

        expect(schema.projects.project.users.user.projects.project).to.be.an.instanceof(SchemaPath);
        expect(schema.projects.project.users.user.projects.project.users).to.equal(undefined);
      });

      it('should circular reference', () => {
        const schema = new Schema();
        const projects = createSchemaCollection('projects');
        const users = createSchemaCollection('users');
        projects.project.addLeaf(users);
        users.user.addLeaf(projects);
        schema.addLeaf(projects);

        expect(schema.projects.project.users.user.projects.project.users).to.be.an.instanceof(SchemaPath);
      });
    });
  });
});
