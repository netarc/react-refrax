/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import {
  descriptorFrom,
  descriptorCollection,
  descriptorCollectionItem
} from 'TestHelper';
import RefraxConstants from 'RefraxConstants';
import RefraxFragmentCache from 'RefraxFragmentCache';

const DefaultPartial = RefraxConstants.defaultFragment;
const STATUS_COMPLETE = RefraxConstants.status.complete;


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

export default function() {
  describe('destroy', function() {
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
    });

    describe('when passed a descriptor', function() {
      var expectedFragments, expectedQueries;

      beforeEach(function() {
        fragmentCache.update(descriptorCollection({
          path: '/projects',
          partial: 'minimal'
        }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], STATUS_COMPLETE);
        fragmentCache.update(descriptorFrom({
          path: '/projects/1'
        }), dataSegmentFull__ID_1, STATUS_COMPLETE);
        fragmentCache.update(descriptorFrom({
          path: '/projects/2'
        }), dataSegmentFull__ID_2, STATUS_COMPLETE);

        expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
        expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
      });

      describe('describing nothing', function() {
        it('should not touch data', function() {
          fragmentCache.destroy(descriptorFrom({}));

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing collection', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorCollection({
            path: '/projects'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects'] = undefined;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing id-resource by path', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorCollectionItem({
            path: '/projects/1'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects/1'] = undefined;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing id-resource by id', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorCollectionItem({
            id: '1'
          }), {
            timestamp: 1234
          });

          expectedFragments[DefaultPartial]['1'] = undefined;
          expectedQueries['/projects'].data = ['2'];

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing collection', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorFrom({
            path: '/foobars'
          }), {
            timestamp: 1234
          });

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by path', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorFrom({
            path: '/projects/11'
          }), {
            timestamp: 1234
          });

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by id', function() {
        it('should update cache', function() {
          fragmentCache.destroy(descriptorFrom({
            id: '11'
          }), {
            timestamp: 1234
          });

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });
    });
  });
}
