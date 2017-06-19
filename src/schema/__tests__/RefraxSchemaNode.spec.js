/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const RefraxTools = require('RefraxTools');
const RefraxSchemaNode = require('RefraxSchemaNode');
const RefraxStore = require('RefraxStore');
const RefraxStoreMap = require('RefraxStoreMap');
const RefraxConstants = require('RefraxConstants');
const CLASSIFY_SCHEMA = RefraxConstants.classify.schema;
const CLASSIFY_NAMESPACE = RefraxConstants.classify.namespace;
const CLASSIFY_COLLECTION = RefraxConstants.classify.collection;
const CLASSIFY_ITEM = RefraxConstants.classify.item;
const CLASSIFY_RESOURCE = RefraxConstants.classify.resource;
const expect = chai.expect;

const it_should_throw_for = (msg, types, options) => {
  RefraxTools.each(types, (type) => {
    RefraxTools.each([].concat(options), (option) => {
      it('should be invalid for type ' + type, () => {
        expect(() => {
          new RefraxSchemaNode(type, option);
        }).to.throw(TypeError, msg);
      });
    });
  });
};

const it_should_not_throw_for = (types, options) => {
  RefraxTools.each(types, (type) => {
    RefraxTools.each([].concat(options), (option) => {
      it('should be invalid for type ' + type, () => {
        expect(() => {
          new RefraxSchemaNode(type, option);
        }).to.not.throw(TypeError);
      });
    });
  });
};

/* eslint-disable no-new */
describe('RefraxSchemaNode', () => {
  describe('instantiation', () => {
    it('should throw an error on invalid arguments', () => {
      expect(() => {
        new RefraxSchemaNode(321);
      }).to.throw(TypeError, 'Invalid type');

      expect(() => {
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, 321);
      }).to.throw(TypeError, 'identifier argument can only be of type');

      expect(() => {
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, { foo: 321 }, { bar: 123 });
      }).to.throw(TypeError, 'identifier argument can only be of type');
    });

    it('should not throw an error on valid arguments', () => {
      expect(() => {
        new RefraxSchemaNode(CLASSIFY_NAMESPACE);
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'foo');
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, 'test', {});
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, {});
      }).to.not.throw(TypeError);
    });

    it('should throw an error on invalid option values', () => {
      expect(() => {
        new RefraxSchemaNode(CLASSIFY_NAMESPACE, { bar: 123 });
      }).to.throw(TypeError, 'Invalid definition option');
    });

    describe('when passed the option', () => {
      describe('storeMap', () => {
        describe('with valid value', () => {
          let options = { storeMap: new RefraxStoreMap() };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_NAMESPACE,
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);

          it_should_not_throw_for([
            CLASSIFY_SCHEMA
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `storeMap` can only be of type RefraxStoreMap', [
            CLASSIFY_SCHEMA
          ], [
            { storeMap: 123 },
            { storeMap: 'foo' },
            { storeMap: {} }
          ]);
        });
      });

      describe('path', () => {
        describe('with valid value', () => {
          let options = { path: '/foo' };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA
          ], options);

          it_should_not_throw_for([
            CLASSIFY_NAMESPACE,
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `path` can only be of type String', [
            CLASSIFY_NAMESPACE,
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { path: 123 },
            { path: null },
            { path: {} }
          ]);
        });
      });

      describe('partial', () => {
        describe('with valid value', () => {
          let options = { partial: 'foo' };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA,
            CLASSIFY_NAMESPACE
          ], options);

          it_should_not_throw_for([
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `partial` can only be of type String', [
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { partial: 123 },
            { partial: null },
            { partial: {} }
          ]);
        });
      });

      describe('fragments', () => {
        describe('with valid value', () => {
          let options = { fragments: ['foo', 'bar'] };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA,
            CLASSIFY_NAMESPACE
          ], options);

          it_should_not_throw_for([
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `fragments` can only be of type Array', [
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { fragments: 123 },
            { fragments: null },
            { fragments: {} }
          ]);

          it_should_throw_for('Option `fragments` contains a non-String value', [
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { fragments: ['foo', 123] },
            { fragments: ['foo', null] }
          ]);
        });
      });

      describe('store', () => {
        describe('with valid value', () => {
          let options = [
            { store: 'foo' },
            { store: new RefraxStore() }
          ];

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA,
            CLASSIFY_NAMESPACE
          ], options);

          it_should_not_throw_for([
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `store` can only be of type String/Store', [
            CLASSIFY_RESOURCE,
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { store: 123 },
            { store: null },
            { store: {} }
          ]);
        });
      });

      describe('paramId', () => {
        describe('with valid value', () => {
          let options = { paramId: 'foo' };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA,
            CLASSIFY_NAMESPACE,
            CLASSIFY_RESOURCE
          ], options);

          it_should_not_throw_for([
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `paramId` can only be of type String', [
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { paramId: 123 },
            { paramId: null },
            { paramId: {} }
          ]);
        });
      });

      describe('paramMap', () => {
        describe('with valid value', () => {
          let options = { paramMap: { foo: 123 } };

          it_should_throw_for('Invalid definition option', [
            CLASSIFY_SCHEMA,
            CLASSIFY_NAMESPACE,
            CLASSIFY_RESOURCE
          ], options);

          it_should_not_throw_for([
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `paramMap` can only be of type Object', [
            CLASSIFY_COLLECTION,
            CLASSIFY_ITEM
          ], [
            { paramMap: 123 },
            { paramMap: null },
            { paramMap: 'zap' }
          ]);
        });
      });
    });
  });

  describe('methods', () => {
  });
});
