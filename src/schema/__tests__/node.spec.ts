/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { SchemaNode } from '../../schema/node';
import { Store } from '../../store/store';
import { StoreMap } from '../../store/storeMap';
import { each } from '../../util/tools';
import { IClassification, IKeyValue } from '../../util/types';

// tslint:disable no-magic-numbers no-unused-expression

const it_should_throw_for = (msg: string, types: IClassification[], options: IKeyValue | IKeyValue[]) => {
  each(types, (type) => {
    each(([] as IKeyValue[]).concat(options), (option) => {
      it('should be invalid for type ' + type, () => {
        expect(() => {
          new SchemaNode(type, option);
        }).to.throw(Error, msg);
      });
    });
  });
};

const it_should_not_throw_for = (types: IClassification[], options: IKeyValue | IKeyValue[]) => {
  each(types, (type) => {
    each(([] as IKeyValue[]).concat(options), (option) => {
      it('should be invalid for type ' + type, () => {
        expect(() => {
          new SchemaNode(type, option);
        }).to.not.throw(Error);
      });
    });
  });
};

describe('SchemaNode', () => {
  describe('instantiation', () => {
    it('should throw an error on invalid arguments', () => {
      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaNode(321);
      }).to.throw(Error, 'Invalid type');

      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaNode(IClassification.namespace, 321);
      }).to.throw(Error, 'identifier argument can only be of type');

      expect(() => {
        // @ts-ignore - invalid argument
        new SchemaNode(IClassification.namespace, { foo: 321 }, { bar: 123 });
      }).to.throw(Error, 'identifier argument can only be of type');
    });

    it('should not throw an error on valid arguments', () => {
      expect(() => {
        new SchemaNode(IClassification.namespace);
        new SchemaNode(IClassification.namespace, 'foo');
        new SchemaNode(IClassification.namespace, 'test', {});
        new SchemaNode(IClassification.namespace, {});
      }).to.not.throw(Error);
    });

    it('should throw an error on invalid option values', () => {
      expect(() => {
        new SchemaNode(IClassification.namespace, { bar: 123 });
      }).to.throw(Error, 'Invalid definition option');
    });

    describe('when passed the option', () => {
      describe('storeMap', () => {
        describe('with valid value', () => {
          const options = { storeMap: new StoreMap() };

          it_should_throw_for('Invalid definition option', [
            IClassification.namespace,
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], options);

          it_should_not_throw_for([
            IClassification.schema
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `storeMap` can only be of type StoreMap', [
            IClassification.schema
          ], [
            { storeMap: 123 },
            { storeMap: 'foo' },
            { storeMap: {} }
          ]);
        });
      });

      describe('path', () => {
        describe('with valid value', () => {
          const options = { path: '/foo' };

          it_should_throw_for('Invalid definition option', [
            IClassification.schema
          ], options);

          it_should_not_throw_for([
            IClassification.namespace,
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `path` can only be of type String', [
            IClassification.namespace,
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], [
            { path: 123 },
            { path: null },
            { path: {} }
          ]);
        });
      });

      describe('partial', () => {
        describe('with valid value', () => {
          const options = { partial: 'foo' };

          it_should_throw_for('Invalid definition option', [
            IClassification.schema,
            IClassification.namespace
          ], options);

          it_should_not_throw_for([
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `partial` can only be of type String', [
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], [
            { partial: 123 },
            { partial: null },
            { partial: {} }
          ]);
        });
      });

      describe('fragments', () => {
        describe('with valid value', () => {
          const options = { fragments: ['foo', 'bar'] };

          it_should_throw_for('Invalid definition option', [
            IClassification.schema,
            IClassification.namespace
          ], options);

          it_should_not_throw_for([
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `fragments` can only be of type Array', [
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], [
            { fragments: 123 },
            { fragments: null },
            { fragments: {} }
          ]);

          it_should_throw_for('Option `fragments` contains a non-String value', [
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], [
            { fragments: ['foo', 123] },
            { fragments: ['foo', null] }
          ]);
        });
      });

      describe('store', () => {
        describe('with valid value', () => {
          const options = [
            { store: 'foo' },
            { store: new Store() }
          ];

          it_should_throw_for('Invalid definition option', [
            IClassification.schema,
            IClassification.namespace
          ], options);

          it_should_not_throw_for([
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `store` can only be of type String/Store', [
            IClassification.resource,
            IClassification.collection,
            IClassification.item
          ], [
            { store: 123 },
            { store: null },
            { store: {} }
          ]);
        });
      });

      describe('paramId', () => {
        describe('with valid value', () => {
          const options = { paramId: 'foo' };

          it_should_throw_for('Invalid definition option', [
            IClassification.schema,
            IClassification.namespace,
            IClassification.resource
          ], options);

          it_should_not_throw_for([
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `paramId` can only be of type String', [
            IClassification.collection,
            IClassification.item
          ], [
            { paramId: 123 },
            { paramId: null },
            { paramId: {} }
          ]);
        });
      });

      describe('paramMap', () => {
        describe('with valid value', () => {
          const options = { paramMap: { foo: 123 } };

          it_should_throw_for('Invalid definition option', [
            IClassification.schema,
            IClassification.namespace,
            IClassification.resource
          ], options);

          it_should_not_throw_for([
            IClassification.collection,
            IClassification.item
          ], options);
        });

        describe('with invalid value', () => {
          it_should_throw_for('Option `paramMap` can only be of type Object', [
            IClassification.collection,
            IClassification.item
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
