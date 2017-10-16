/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import {
  descriptorResource,
  descriptorFrom,
  descriptorCollection,
  descriptorCollectionItem
} from 'TestHelper';
import RefraxConstants from 'RefraxConstants';
import RefraxFragmentCache from 'RefraxFragmentCache';
import RefraxFragmentResult from 'RefraxFragmentResult';

const STATUS_STALE = RefraxConstants.status.stale;
const STATUS_COMPLETE = RefraxConstants.status.complete;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;


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
  {title: 'item 1 - foo', id: 'item:1'},
  {title: 'item 2 - bar', id: 'item:2'},
  {title: 'item 3 - zoo', id: 'item:3'}
];

const dataSegmentResource_Object = {
  foo: 'bar',
  zoo: 132,
  baz: {
    title: 'zipper'
  }
};

const dataSegmentResource_String = 'the foo went to the zoo';

function expectResultDefault(result) {
  expect(result).to.be.an.instanceof(RefraxFragmentResult);
  expect(result).to.have.property('status')
    .that.equals(STATUS_STALE);
  expect(result).to.have.property('timestamp')
    .that.equal(TIMESTAMP_STALE);
  expect(result).to.have.property('data')
    .that.equal(null);
}

function expectResultWithContent(result, data) {
  expect(result).to.be.an.instanceof(RefraxFragmentResult);
  expect(result).to.have.property('status')
    .that.equals(STATUS_COMPLETE);
  expect(result).to.have.property('timestamp')
    .that.is.above(TIMESTAMP_STALE);
  expect(result).to.have.property('data')
    .that.deep.equals(data);
}

export default function() {
  describe('fetch', function() {
    var fragmentCache;

    beforeEach(function() {
      fragmentCache = new RefraxFragmentCache();

      fragmentCache.update(descriptorCollection({
        path: '/projects',
        partial: 'minimal'
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], STATUS_COMPLETE);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/1'
      }), dataSegmentFull__ID_1, STATUS_COMPLETE);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/2'
      }), dataSegmentFull__ID_2, STATUS_COMPLETE);

      fragmentCache.update(descriptorResource({
        path: '/resource-array'
      }), dataSegmentResource_Array, STATUS_COMPLETE);
      fragmentCache.update(descriptorResource({
        path: '/resource-object'
      }), dataSegmentResource_Object, STATUS_COMPLETE);
      fragmentCache.update(descriptorResource({
        path: '/resource-string'
      }), dataSegmentResource_String, STATUS_COMPLETE);
    });

    describe('when passed a descriptor', function() {
      describe('describing nothing', function() {
        it('should return a default result', function() {
          var descriptor = descriptorFrom({})
            , result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing a collection', function() {
        it('should return expected result', function() {
          var descriptor = descriptorCollection({
              path: '/projects'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, [
            dataSegmentFull__ID_1,
            dataSegmentFull__ID_2
          ]);
        });

        it('should return expected result for a partial', function() {
          var descriptor = descriptorCollection({
              path: '/projects',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, [
            dataSegmentPartial__ID_1,
            dataSegmentPartial__ID_2
          ]);
        });

        it('should return default result for non-existing path', function() {
          var descriptor = descriptorCollection({
              path: '/projectz',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an id-resource by path', function() {
        it('should return expected result', function() {
          var descriptor = descriptorCollectionItem({
              path: '/projects/1'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentFull__ID_1);
        });

        it('should return expected result for a partial', function() {
          var descriptor = descriptorCollectionItem({
              path: '/projects/1',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentPartial__ID_1);
        });

        it('should return default result for non-existing path', function() {
          var descriptor = descriptorCollectionItem({
              path: '/projects/11',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an id-resource by id', function() {
        it('should return expected result', function() {
          var descriptor = descriptorCollectionItem({
              id: '1'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentFull__ID_1);
        });

        it('should return expected result for a partial', function() {
          var descriptor = descriptorCollectionItem({
              id: '1',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentPartial__ID_1);
        });

        it('should return default result for non-existing id', function() {
          var descriptor = descriptorCollectionItem({
              id: '11',
              partial: 'minimal'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultDefault(result);
        });
      });

      describe('describing an array resource', function() {
        it('should return expected result', function() {
          var descriptor = descriptorFrom({
              path: '/resource-array'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_Array);
        });
      });

      describe('describing an object resource', function() {
        it('should return expected result', function() {
          var descriptor = descriptorFrom({
              path: '/resource-object'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_Object);
        });
      });

      describe('describing a string resource', function() {
        it('should return expected result', function() {
          var descriptor = descriptorFrom({
              path: '/resource-string'
            })
            , result = fragmentCache.fetch(descriptor);

          expectResultWithContent(result, dataSegmentResource_String);
        });
      });
    });
  });
}
