/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const TestHelper = require('TestHelper');
const RefraxConstants = require('RefraxConstants');
const RefraxFragmentCache = require('RefraxFragmentCache');
const expect = chai.expect;
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
  describe('touch', function() {
    var fragmentCache;

    beforeEach(function() {
      fragmentCache = new RefraxFragmentCache();
    });

    describe('when passed a descriptor', function() {
      var expectedFragments, expectedQueries;

      beforeEach(function() {
        fragmentCache.update(TestHelper.descriptorCollection({
          path: '/projects',
          partial: 'minimal'
        }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], STATUS_COMPLETE);
        fragmentCache.update(TestHelper.descriptorCollectionItem({
          path: '/projects/1'
        }), dataSegmentFull__ID_1, STATUS_COMPLETE);
        fragmentCache.update(TestHelper.descriptorCollectionItem({
          path: '/projects/2'
        }), dataSegmentFull__ID_2, STATUS_COMPLETE);

        expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
        expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
      });

      describe('describing nothing', function() {
        it('should not touch data', function() {
          fragmentCache.touch(TestHelper.descriptorFrom({}));

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('alongside no touch data', function() {
        it('should not touch data', function() {
          fragmentCache.touch(TestHelper.descriptorFrom({
            path: '/projects'
          }));
          fragmentCache.touch(TestHelper.descriptorFrom({
            path: '/projects',
            partial: 'minimal'
          }));
          fragmentCache.touch(TestHelper.descriptorFrom({
            path: '/projects/1'
          }));

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing collection', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorFrom({
            path: '/projects'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects'].timestamp = 1234;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing id-resource by path', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorCollectionItem({
            path: '/projects/1'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects/1'].timestamp = 1234;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing id-resource by id', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorCollectionItem({
            id: '1'
          }), {
            timestamp: 1234
          });

          expectedFragments[DefaultPartial]['1'].timestamp = 1234;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing collection', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorCollection({
            path: '/foobars'
          }), {
            timestamp: 1234
          });

          expectedQueries['/foobars'] = {timestamp: 1234};

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by path', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorCollectionItem({
            path: '/projects/11'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects/11'] = {timestamp:  1234};

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by id', function() {
        it('should update cache', function() {
          fragmentCache.touch(TestHelper.descriptorCollectionItem({
            id: '11'
          }), {
            timestamp: 1234
          });

          expectedFragments[DefaultPartial]['11'] = {timestamp: 1234};

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });
    });
  });
}
