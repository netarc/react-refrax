/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const RefraxResourceDescriptor = require('RefraxResourceDescriptor');
const RefraxSchemaPath = require('RefraxSchemaPath');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxSchema = require('RefraxSchema');
const createSchemaCollection = require('createSchemaCollection');
const createSchemaNamespace = require('createSchemaNamespace');
const RefraxParameters = require('RefraxParameters');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const ACTION_GET = RefraxConstants.action.get;
const ACTION_INSPECT = RefraxConstants.action.inspect;
const STATUS_COMPLETE = RefraxConstants.status.complete;
const STRATEGY_REPLACE = RefraxConstants.strategy.replace;
const FRAGMENT_DEFAULT = RefraxConstants.defaultFragment;
const expect = chai.expect;


const dataCollectionProjects = [
  { id: 1, name: 'project 1' },
  { id: 2, name: 'project 2' }
];

const dataCollectionUsers = [
  { id: 1, name: 'user bob' },
  { id: 2, name: 'user sue' }
];

/* eslint-disable no-new */
describe('RefraxSchemaPath', () => {
  describe('instantiation', () => {
    it('should throw an error when passed invalid arguments', () => {
      expect(() => {
        new RefraxSchemaPath();
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(() => {
        new RefraxSchemaPath(123);
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(() => {
        new RefraxSchemaPath('foo');
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');

      expect(() => {
        new RefraxSchemaPath({bar: 23});
      }).to.throw(Error, 'Expected node of type RefraxSchemaNode but found');
    });

    it('should not throw an error when passed valid arguments', () => {
      expect(() => {
        new RefraxSchemaPath(new RefraxSchemaNode());
      }).to.not.throw(Error);
    });
  });

  describe('methods', () => {
    describe('enumerateLeafs', () => {
      it('should only enumerate shallow leafs', () => {
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode()
          , schemaNodeWithLiteral = new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'foo')
          , schemaNodeNested = new RefraxSchemaNode()
          , keys = []
          , accessorNodes = [];

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
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode();

        expect(() => {
          nodeAccessor.addLeaf(123);
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(() => {
          nodeAccessor.addLeaf('abc');
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(() => {
          nodeAccessor.addLeaf('abc', {});
        }).to.throw(Error, 'Expected leaf of type RefraxSchemaPath or RefraxSchemaNode');

        expect(() => {
          nodeAccessor.addLeaf(schemaNode);
        }).to.throw(Error, 'Failed to add leaf with no inherit identifier');
      });

      it('should not throw an error on valid arguments', () => {
        var nodeAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode = new RefraxSchemaNode()
          , schemaNodeWithLiteral = new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'foo');

        expect(() => {
          nodeAccessor.addLeaf('bar', schemaNode);
          nodeAccessor.addLeaf(schemaNodeWithLiteral);
        }).to.not.throw(Error);
      });

      it('should correctly add an accessible leaf', () => {
        var rootAccessor = new RefraxSchemaPath(new RefraxSchemaNode())
          , schemaNode1 = new RefraxSchemaNode()
          , schemaNode2 = new RefraxSchemaNode();

        rootAccessor.addLeaf('foo', schemaNode1);
        expect(rootAccessor).to.have.property('foo')
          .that.is.an.instanceof(RefraxSchemaPath);
        expect(rootAccessor.foo.__node).to.equal(schemaNode1);

        rootAccessor.foo.addLeaf('bar', schemaNode2);
        expect(rootAccessor).to.not.have.property('bar');
        expect(rootAccessor.foo).to.have.property('bar')
          .that.is.an.instanceof(RefraxSchemaPath);
        expect(rootAccessor.foo.bar.__node).to.equal(schemaNode2);

        expect(rootAccessor.foo.bar).to.not.have.property('foo');
      });
    });

    describe(ACTION_INSPECT, () => {
      it('should correctly describe hierarchy', () => {
        const schema = new RefraxSchema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));

        expect(schema.inspect())
          .to.deep.match({
            '/api': {
              action: ACTION_INSPECT,
              basePath: '/api',
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
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
              action: ACTION_INSPECT,
              basePath: '/api/projects',
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_COLLECTION,
              collectionStrategy: STRATEGY_REPLACE,
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
              action: ACTION_INSPECT,
              basePath: '/api/projects/:projectId',
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_ITEM,
              collectionStrategy: STRATEGY_REPLACE,
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
              action: ACTION_INSPECT,
              basePath: '/api/projects/bar',
              cacheStrategy: STRATEGY_REPLACE,
              classify: CLASSIFY_NAMESPACE,
              collectionStrategy: STRATEGY_REPLACE,
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
      let schema = null;

      beforeEach(() => {
        let descriptor;

        schema = new RefraxSchema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));
        schema.api.projects.project.addLeaf(createSchemaCollection('users'));

        descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.api.projects.__stack);
        descriptor.store.updateResource(descriptor, dataCollectionProjects, STATUS_COMPLETE);

        descriptor = new RefraxResourceDescriptor(null, ACTION_GET, [].concat(
          schema.api.projects.project.users.__stack,
          new RefraxParameters({ projectId: 1 })
        ));
        descriptor.store.updateResource(descriptor, dataCollectionUsers, STATUS_COMPLETE);
      });

      it('should correctly invoke store invalidate', () => {
        const storeProject = schema.__node.definition.storeMap.__map['project'];
        const storeUser = schema.__node.definition.storeMap.__map['user'];

        sinon.spy(storeProject, 'invalidate');
        sinon.spy(storeUser, 'invalidate');

        schema.api.projects.invalidate();

        expect(storeProject.invalidate.callCount).to.equal(1);
        expect(storeUser.invalidate.callCount).to.equal(0);
        expect(storeProject.invalidate.getCall(0).args[0]).to.deep.match({
          action: ACTION_GET,
          basePath: '/api/projects',
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_COLLECTION,
          collectionStrategy: STRATEGY_REPLACE,
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

        sinon.spy(store, 'invalidate');

        schema.api.projects
          .withParams({ foo: 123 })
          .withQueryParams({ bar: 321 })
          .invalidate();

        expect(store.invalidate.callCount).to.equal(1);
        expect(store.invalidate.getCall(0).args[0]).to.deep.match({
          action: ACTION_GET,
          basePath: '/api/projects?bar=321',
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_COLLECTION,
          collectionStrategy: STRATEGY_REPLACE,
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

        sinon.spy(store, 'invalidate');

        schema.api.projects.invalidate({ noNotify: true });

        expect(store.invalidate.getCall(0).args[1]).to.deep.equal({ noNotify: true });
      });

      describe('with option cascade', () => {
        it('should correctly enumerate leafs and invalidate', () => {
          const storeProject = schema.__node.definition.storeMap.__map['project'];
          const storeUser = schema.__node.definition.storeMap.__map['user'];

          sinon.spy(storeProject, 'invalidate');
          sinon.spy(storeUser, 'invalidate');

          console.info("pre invalidate")
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

          sinon.spy(storeProject, 'invalidate');
          sinon.spy(storeUser, 'invalidate');

          schema.api.projects.invalidate({ cascade: true });

          expect(storeProject.invalidate.callCount).to.equal(1);
          expect(storeUser.invalidate.callCount).to.equal(0);
          expect(storeProject.invalidate.getCall(0).args[1]).to.deep.equal({ cascade: true });
        });
      });
    });

    describe('invalidateLeafs', () => {
      let schema = null;

      beforeEach(() => {
        let descriptor;

        schema = new RefraxSchema();
        schema.addLeaf(createSchemaNamespace('api'));
        schema.api.addLeaf(createSchemaCollection('projects'));
        schema.api.projects.addLeaf(createSchemaNamespace('bar'));
        schema.api.projects.project.addLeaf(createSchemaCollection('users'));

        descriptor = new RefraxResourceDescriptor(null, ACTION_GET, schema.api.projects.__stack);
        descriptor.store.updateResource(descriptor, dataCollectionProjects, STATUS_COMPLETE);

        descriptor = new RefraxResourceDescriptor(null, ACTION_GET, [].concat(
          schema.api.projects.project.users.__stack,
          new RefraxParameters({ projectId: 1 })
        ));
        descriptor.store.updateResource(descriptor, dataCollectionUsers, STATUS_COMPLETE);
      });

      it('should correctly invoke store invalidate', () => {
        const storeProject = schema.__node.definition.storeMap.__map['project'];
        const storeUser = schema.__node.definition.storeMap.__map['user'];

        sinon.spy(storeProject, 'invalidate');
        sinon.spy(storeUser, 'invalidate');

        schema.api.projects.withParams({ projectId: 123 }).invalidateLeafs();

        expect(storeProject.invalidate.callCount).to.equal(1);
        expect(storeUser.invalidate.callCount).to.equal(0);
        expect(storeProject.invalidate.getCall(0).args[0]).to.deep.match({
          action: ACTION_GET,
          basePath: '/api/projects/123',
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_ITEM,
          collectionStrategy: STRATEGY_REPLACE,
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

        sinon.spy(store, 'invalidate');

        schema.api.projects
          .withParams({ projectId: 123 })
          .withQueryParams({ bar: 321 })
          .invalidateLeafs();

        expect(store.invalidate.callCount).to.equal(1);
        expect(store.invalidate.getCall(0).args[0]).to.deep.match({
          action: ACTION_GET,
          basePath: '/api/projects/123?bar=321',
          cacheStrategy: STRATEGY_REPLACE,
          classify: CLASSIFY_ITEM,
          collectionStrategy: STRATEGY_REPLACE,
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

        sinon.spy(store, 'invalidate');

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
        let schema = new RefraxSchema();
        let projects = createSchemaCollection('projects');
        let users = createSchemaCollection('users');

        schema.addLeaf(projects);
        schema.projects.project.addDetachedLeaf(users);
        users.user.addLeaf(projects);

        expect(schema.projects.project.users.user.projects.project).to.be.an.instanceof(RefraxSchemaPath);
        expect(schema.projects.project.users.user.projects.project.users).to.equal(undefined);
      });

      it('should circular reference', () => {
        let schema = new RefraxSchema();
        let projects = createSchemaCollection('projects');
        let users = createSchemaCollection('users');
        projects.project.addLeaf(users);
        users.user.addLeaf(projects);
        schema.addLeaf(projects);

        expect(schema.projects.project.users.user.projects.project.users).to.be.an.instanceof(RefraxSchemaPath);
      });
    });
  });
});
