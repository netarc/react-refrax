/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import {
  descriptorCollection,
  descriptorCollectionItem,
  descriptorFrom,
  descriptorResource
} from 'test/TestHelper';

import { FragmentCache } from '../../store/fragmentCache';
import { FragmentResult } from '../../store/fragmentResult';
import { IStatus, ITimestamp } from '../../util/types';

// tslint:disable no-magic-numbers align

const dataSegmentFull__ID_1 = {
  id: 1,
  title: 'Foo Project',
  description: 'This is the Foo project on wheels'
};
const dataSegmentFull__ID_2 = {
  id: 2,
  title: 'Bar Project',
  description: 'This is the Bar project on wheels'
};

const dataSegmentPartial__ID_1 = {
  id: 1,
  title: 'Foo Project'
};
const dataSegmentPartial__ID_2 = {
  id: 2,
  title: 'Bar Project'
};

const dataSegmentResource_Array = [
  { title: 'item 1 - foo', id: 'item:1' },
  { title: 'item 2 - bar', id: 'item:2' },
  { title: 'item 3 - zoo', id: 'item:3' }
];

const dataSegmentResource_Object = {
  foo: 'bar',
  zoo: 132,
  baz: {
    title: 'zipper'
  }
};

const dataSegmentResource_String = 'the foo went to the zoo';

const expectResultDefault = (result: any): void => {
  expect(result).to.be.an.instanceof(FragmentResult);
  expect(result).to.have.property('status')
    .that.equals(IStatus.stale);
  expect(result).to.have.property('timestamp')
    .that.equal(ITimestamp.stale);
  expect(result).to.have.property('data')
    .that.equal(null);
};

const expectResultWithContent = (result: any, data: any): void => {
  expect(result).to.be.an.instanceof(FragmentResult);
  expect(result).to.have.property('status')
    .that.equals(IStatus.complete);
  expect(result).to.have.property('timestamp')
    .that.is.above(ITimestamp.stale);
  expect(result).to.have.property('data')
    .that.deep.equals(data);
};

// tslint:disable-next-line:no-default-export
export default (): void => {
  describe('fetch', () => {
    let fragmentCache: FragmentCache;

    beforeEach(() => {
      fragmentCache = new FragmentCache();

      fragmentCache.update(descriptorCollection({
        path: '/projects',
        partial: 'minimal'
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/1'
      }), dataSegmentFull__ID_1, IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/2'
      }), dataSegmentFull__ID_2, IStatus.complete);

      fragmentCache.update(descriptorResource({
        path: '/resource-array'
      }), dataSegmentResource_Array, IStatus.complete);
      fragmentCache.update(descriptorResource({
        path: '/resource-object'
      }), dataSegmentResource_Object, IStatus.complete);
      fragmentCache.update(descriptorResource({
        path: '/resource-string'
      }), dataSegmentResource_String, IStatus.complete);
    });

    describe('when passed a descriptor', () => {
      describe('describing nothing', () => {
        it('should return a default result', () => {
          const descriptor = descriptorFrom({});
          const result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing a collection', () => {
        it('should return expected result', () => {
          const descriptor = descriptorCollection({
            path: '/projects'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, [
            dataSegmentFull__ID_1,
            dataSegmentFull__ID_2
          ]);
        });

        it('should return expected result for a partial', () => {
          const descriptor = descriptorCollection({
            path: '/projects',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, [
            dataSegmentPartial__ID_1,
            dataSegmentPartial__ID_2
          ]);
        });

        it('should return default result for non-existing path', () => {
          const descriptor = descriptorCollection({
            path: '/projectz',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an id-resource by path', () => {
        it('should return expected result', () => {
          const descriptor = descriptorCollectionItem({
            path: '/projects/1'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentFull__ID_1);
        });

        it('should return expected result for a partial', () => {
          const descriptor = descriptorCollectionItem({
            path: '/projects/1',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentPartial__ID_1);
        });

        it('should return default result for non-existing path', () => {
          const descriptor = descriptorCollectionItem({
            path: '/projects/11',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an id-resource by id', () => {
        it('should return expected result', () => {
          const descriptor = descriptorCollectionItem({
            id: '1'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentFull__ID_1);
        });

        it('should return expected result for a partial', () => {
          const descriptor = descriptorCollectionItem({
            id: '1',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentPartial__ID_1);
        });

        it('should return default result for non-existing id', () => {
          const descriptor = descriptorCollectionItem({
            id: '11',
            partial: 'minimal'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an array resource', () => {
        it('should return expected result', () => {
          const descriptor = descriptorFrom({
            path: '/resource-array'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_Array);
        });
      });

      describe('describing an object resource', () => {
        it('should return expected result', () => {
          const descriptor = descriptorFrom({
            path: '/resource-object'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_Object);
        });
      });

      describe('describing a string resource', () => {
        it('should return expected result', () => {
          const descriptor = descriptorFrom({
            path: '/resource-string'
          });
          const result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_String);
        });
      });
    });
  });
};
