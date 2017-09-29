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
const MinimalPartial = 'minimal';
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
const dataSegmentFull__ID_3 = {
  id: 3,
  title: 'Zoo Project',
  description: 'This is the Zoo project on wheels'
};

const dataSegmentPartial__ID_1 = {
  id: 1,
  title: 'Foo Project'
};
const dataSegmentPartial__ID_2 = {
  id: 2,
  title: 'Bar Project'
};
const dataSegmentPartial__ID_3 = {
  id: 3,
  title: 'Zoo Project'
};

export default function() {
  describe('invalidate', function() {
    var fragmentCache, expectedFragments, expectedQueries;

    beforeEach(function() {
      fragmentCache = new RefraxFragmentCache();

      fragmentCache.update(TestHelper.descriptorCollection({
        path: '/projects',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], STATUS_COMPLETE);
      fragmentCache.update(TestHelper.descriptorCollection({
        path: '/projects?filter=123',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_3], STATUS_COMPLETE);

      fragmentCache.update(TestHelper.descriptorCollectionItem({
        path: '/projects/1'
      }), dataSegmentFull__ID_1, STATUS_COMPLETE);
      fragmentCache.update(TestHelper.descriptorCollectionItem({
        path: '/projects/2'
      }), dataSegmentFull__ID_2, STATUS_COMPLETE);
      fragmentCache.update(TestHelper.descriptorCollectionItem({
        path: '/projects/3'
      }), dataSegmentFull__ID_3, STATUS_COMPLETE);

      expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
      expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
    });

    describe('when passed a descriptor', function() {
      describe('describing nothing', function() {
        const descriptor = TestHelper.descriptorFrom({});

        it('should not touch data', function() {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing an existing collection', function() {
        const descriptor = TestHelper.descriptorCollection({
          path: '/projects'
        });

        it('should correctly invalidate cache', function() {
          fragmentCache.invalidate(descriptor);

          expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects'].status = STATUS_STALE;
          expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects?filter=123'].status = STATUS_STALE;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should correctly invalidate cache', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects'].status = STATUS_STALE;
            expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects?filter=123'].status = STATUS_STALE;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing an existing id-resource by path', function() {
        const descriptor = TestHelper.descriptorCollectionItem({
          path: '/projects/1'
        });

        it('should correctly invalidate cache', function() {
          fragmentCache.invalidate(descriptor);

          expectedQueries['/projects/1'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects/1'].status = STATUS_STALE;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should correctly invalidate cache', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expectedQueries['/projects/1'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects/1'].status = STATUS_STALE;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing an existing id-resource by id', function() {
        const descriptor = TestHelper.descriptorCollectionItem({
          id: '1'
        });

        const descriptor2 = TestHelper.descriptorCollectionItem({
          id: '2'
        });

        describe('should update cache', function() {
          it('with a common id', function() {
            fragmentCache.invalidate(descriptor);

            expectedFragments[DefaultPartial]['1'].timestamp = TIMESTAMP_STALE;
            expectedFragments[DefaultPartial]['1'].status = STATUS_STALE;
            expectedFragments[MinimalPartial]['1'].timestamp = TIMESTAMP_STALE;
            expectedFragments[MinimalPartial]['1'].status = STATUS_STALE;
            expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects'].status = STATUS_STALE;
            expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects?filter=123'].status = STATUS_STALE;

            expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
          });

          it('with a un-common id', function() {
            fragmentCache.invalidate(descriptor2);

            expectedFragments[DefaultPartial]['2'].timestamp = TIMESTAMP_STALE;
            expectedFragments[DefaultPartial]['2'].status = STATUS_STALE;
            expectedFragments[MinimalPartial]['2'].timestamp = TIMESTAMP_STALE;
            expectedFragments[MinimalPartial]['2'].status = STATUS_STALE;
            expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
            expectedQueries['/projects'].status = STATUS_STALE;

            expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
          });
        });

        describe('with noFragments option specified', function() {
          describe('should correctly invalidate cache', function() {
            it('with a common id', function() {
              fragmentCache.invalidate(descriptor, {
                noFragments: true
              });

              expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
              expectedQueries['/projects'].status = STATUS_STALE;
              expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
              expectedQueries['/projects?filter=123'].status = STATUS_STALE;

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('with a un-common id', function() {
              fragmentCache.invalidate(descriptor2, {
                noFragments: true
              });

              expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
              expectedQueries['/projects'].status = STATUS_STALE;

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        describe('with noQueries option specified', function() {
          it('should correctly invalidate cache', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expectedFragments[DefaultPartial]['1'].timestamp = TIMESTAMP_STALE;
            expectedFragments[DefaultPartial]['1'].status = STATUS_STALE;
            expectedFragments[MinimalPartial]['1'].timestamp = TIMESTAMP_STALE;
            expectedFragments[MinimalPartial]['1'].status = STATUS_STALE;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing a non-existing collection', function() {
        const descriptor = TestHelper.descriptorFrom({
          path: '/foobars'
        });

        it('should not touch data', function() {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing a non-existing id-resource by path', function() {
        const descriptor = TestHelper.descriptorFrom({
          path: '/projects/11'
        });

        it('should update cache', function() {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing a non-existing id-resource by id', function() {
        const descriptor = TestHelper.descriptorFrom({
          id: '11'
        });

        it('should not touch data', function() {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', function() {
          it('should not touch data', function() {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });
    });

    describe('when not passed a descriptor', function() {
      it('should correctly invalidate cache', function() {
        fragmentCache.invalidate();

        expectedFragments[DefaultPartial]['1'].timestamp = TIMESTAMP_STALE;
        expectedFragments[DefaultPartial]['1'].status = STATUS_STALE;
        expectedFragments[MinimalPartial]['1'].timestamp = TIMESTAMP_STALE;
        expectedFragments[MinimalPartial]['1'].status = STATUS_STALE;
        expectedFragments[DefaultPartial]['2'].timestamp = TIMESTAMP_STALE;
        expectedFragments[DefaultPartial]['2'].status = STATUS_STALE;
        expectedFragments[MinimalPartial]['2'].timestamp = TIMESTAMP_STALE;
        expectedFragments[MinimalPartial]['2'].status = STATUS_STALE;
        expectedFragments[DefaultPartial]['3'].timestamp = TIMESTAMP_STALE;
        expectedFragments[DefaultPartial]['3'].status = STATUS_STALE;
        expectedFragments[MinimalPartial]['3'].timestamp = TIMESTAMP_STALE;
        expectedFragments[MinimalPartial]['3'].status = STATUS_STALE;
        expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
        expectedQueries['/projects'].status = STATUS_STALE;
        expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
        expectedQueries['/projects?filter=123'].status = STATUS_STALE;
        expectedQueries['/projects/1'].timestamp = TIMESTAMP_STALE;
        expectedQueries['/projects/1'].status = STATUS_STALE;
        expectedQueries['/projects/2'].timestamp = TIMESTAMP_STALE;
        expectedQueries['/projects/2'].status = STATUS_STALE;
        expectedQueries['/projects/3'].timestamp = TIMESTAMP_STALE;
        expectedQueries['/projects/3'].status = STATUS_STALE;

        expect(fragmentCache).to.have.property('fragments')
          .that.deep.equals(expectedFragments);
        expect(fragmentCache).to.have.property('queries')
          .that.deep.equals(expectedQueries);
      });

      describe('with noFragments option specified', function() {
        it('should correctly invalidate cache', function() {
          fragmentCache.invalidate(null, {
            noFragments: true
          });

          expectedQueries['/projects'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects'].status = STATUS_STALE;
          expectedQueries['/projects?filter=123'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects?filter=123'].status = STATUS_STALE;
          expectedQueries['/projects/1'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects/1'].status = STATUS_STALE;
          expectedQueries['/projects/2'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects/2'].status = STATUS_STALE;
          expectedQueries['/projects/3'].timestamp = TIMESTAMP_STALE;
          expectedQueries['/projects/3'].status = STATUS_STALE;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('with noQueries option specified', function() {
        it('should correctly invalidate cache', function() {
          fragmentCache.invalidate(null, {
            noQueries: true
          });

          expectedFragments[DefaultPartial]['1'].timestamp = TIMESTAMP_STALE;
          expectedFragments[DefaultPartial]['1'].status = STATUS_STALE;
          expectedFragments[MinimalPartial]['1'].timestamp = TIMESTAMP_STALE;
          expectedFragments[MinimalPartial]['1'].status = STATUS_STALE;
          expectedFragments[DefaultPartial]['2'].timestamp = TIMESTAMP_STALE;
          expectedFragments[DefaultPartial]['2'].status = STATUS_STALE;
          expectedFragments[MinimalPartial]['2'].timestamp = TIMESTAMP_STALE;
          expectedFragments[MinimalPartial]['2'].status = STATUS_STALE;
          expectedFragments[DefaultPartial]['3'].timestamp = TIMESTAMP_STALE;
          expectedFragments[DefaultPartial]['3'].status = STATUS_STALE;
          expectedFragments[MinimalPartial]['3'].timestamp = TIMESTAMP_STALE;
          expectedFragments[MinimalPartial]['3'].status = STATUS_STALE;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });
    });
  });
}
