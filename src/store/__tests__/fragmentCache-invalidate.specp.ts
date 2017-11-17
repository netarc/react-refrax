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
  descriptorFrom
} from 'test/TestHelper';

import { FragmentCache } from '../../store/fragmentCache';
import RefraxConfig from '../../util/config';
import { IStatus, ITimestamp } from '../../util/types';

// tslint:disable no-magic-numbers align

const DefaultPartial = RefraxConfig.defaultFragment;
const MinimalPartial = 'minimal';

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

// tslint:disable-next-line:no-default-export
export default (): void => {
  describe('invalidate', () => {
    let fragmentCache: FragmentCache;
    let expectedFragments: {[key: string]: any};
    let expectedQueries: {[key: string]: any};

    beforeEach(() => {
      fragmentCache = new FragmentCache();

      fragmentCache.update(descriptorCollection({
        path: '/projects',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2], IStatus.complete);
      fragmentCache.update(descriptorCollection({
        path: '/projects?filter=123',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_3], IStatus.complete);

      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/1'
      }), dataSegmentFull__ID_1, IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/2'
      }), dataSegmentFull__ID_2, IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/3'
      }), dataSegmentFull__ID_3, IStatus.complete);

      expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
      expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
    });

    describe('when passed a descriptor', () => {
      describe('describing nothing', () => {
        const descriptor = descriptorFrom({});

        it('should not touch data', () => {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should not touch data', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

      describe('describing an existing collection', () => {
        const descriptor = descriptorCollection({
          path: '/projects'
        });

        it('should correctly invalidate cache', () => {
          fragmentCache.invalidate(descriptor);

          expectedQueries['/projects'].timestamp = ITimestamp.stale;
          expectedQueries['/projects'].status = IStatus.stale;
          expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
          expectedQueries['/projects?filter=123'].status = IStatus.stale;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should correctly invalidate cache', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expectedQueries['/projects'].timestamp = ITimestamp.stale;
            expectedQueries['/projects'].status = IStatus.stale;
            expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
            expectedQueries['/projects?filter=123'].status = IStatus.stale;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

      describe('describing an existing id-resource by path', () => {
        const descriptor = descriptorCollectionItem({
          path: '/projects/1'
        });

        it('should correctly invalidate cache', () => {
          fragmentCache.invalidate(descriptor);

          expectedQueries['/projects/1'].timestamp = ITimestamp.stale;
          expectedQueries['/projects/1'].status = IStatus.stale;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should correctly invalidate cache', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expectedQueries['/projects/1'].timestamp = ITimestamp.stale;
            expectedQueries['/projects/1'].status = IStatus.stale;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

      describe('describing an existing id-resource by id', () => {
        const descriptor = descriptorCollectionItem({
          id: '1'
        });

        const descriptor2 = descriptorCollectionItem({
          id: '2'
        });

        describe('should update cache', () => {
          it('with a common id', () => {
            fragmentCache.invalidate(descriptor);

            expectedFragments[DefaultPartial]['1'].timestamp = ITimestamp.stale;
            expectedFragments[DefaultPartial]['1'].status = IStatus.stale;
            expectedFragments[MinimalPartial]['1'].timestamp = ITimestamp.stale;
            expectedFragments[MinimalPartial]['1'].status = IStatus.stale;
            expectedQueries['/projects'].timestamp = ITimestamp.stale;
            expectedQueries['/projects'].status = IStatus.stale;
            expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
            expectedQueries['/projects?filter=123'].status = IStatus.stale;

            expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
          });

          it('with a un-common id', () => {
            fragmentCache.invalidate(descriptor2);

            expectedFragments[DefaultPartial]['2'].timestamp = ITimestamp.stale;
            expectedFragments[DefaultPartial]['2'].status = IStatus.stale;
            expectedFragments[MinimalPartial]['2'].timestamp = ITimestamp.stale;
            expectedFragments[MinimalPartial]['2'].status = IStatus.stale;
            expectedQueries['/projects'].timestamp = ITimestamp.stale;
            expectedQueries['/projects'].status = IStatus.stale;

            expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
          });
        });

        describe('with noFragments option specified', () => {
          describe('should correctly invalidate cache', () => {
            it('with a common id', () => {
              fragmentCache.invalidate(descriptor, {
                noFragments: true
              });

              expectedQueries['/projects'].timestamp = ITimestamp.stale;
              expectedQueries['/projects'].status = IStatus.stale;
              expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
              expectedQueries['/projects?filter=123'].status = IStatus.stale;

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('with a un-common id', () => {
              fragmentCache.invalidate(descriptor2, {
                noFragments: true
              });

              expectedQueries['/projects'].timestamp = ITimestamp.stale;
              expectedQueries['/projects'].status = IStatus.stale;

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        describe('with noQueries option specified', () => {
          it('should correctly invalidate cache', () => {
            fragmentCache.invalidate(descriptor, {
              noQueries: true
            });

            expectedFragments[DefaultPartial]['1'].timestamp = ITimestamp.stale;
            expectedFragments[DefaultPartial]['1'].status = IStatus.stale;
            expectedFragments[MinimalPartial]['1'].timestamp = ITimestamp.stale;
            expectedFragments[MinimalPartial]['1'].status = IStatus.stale;

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      describe('describing a non-existing collection', () => {
        const descriptor = descriptorFrom({
          path: '/foobars'
        });

        it('should not touch data', () => {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should not touch data', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

      describe('describing a non-existing id-resource by path', () => {
        const descriptor = descriptorFrom({
          path: '/projects/11'
        });

        it('should update cache', () => {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should not touch data', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

      describe('describing a non-existing id-resource by id', () => {
        const descriptor = descriptorFrom({
          id: '11'
        });

        it('should not touch data', () => {
          fragmentCache.invalidate(descriptor);

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });

        describe('with noFragments option specified', () => {
          it('should not touch data', () => {
            fragmentCache.invalidate(descriptor, {
              noFragments: true
            });

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with noQueries option specified', () => {
          it('should not touch data', () => {
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

    describe('when not passed a descriptor', () => {
      it('should correctly invalidate cache', () => {
        fragmentCache.invalidate();

        expectedFragments[DefaultPartial]['1'].timestamp = ITimestamp.stale;
        expectedFragments[DefaultPartial]['1'].status = IStatus.stale;
        expectedFragments[MinimalPartial]['1'].timestamp = ITimestamp.stale;
        expectedFragments[MinimalPartial]['1'].status = IStatus.stale;
        expectedFragments[DefaultPartial]['2'].timestamp = ITimestamp.stale;
        expectedFragments[DefaultPartial]['2'].status = IStatus.stale;
        expectedFragments[MinimalPartial]['2'].timestamp = ITimestamp.stale;
        expectedFragments[MinimalPartial]['2'].status = IStatus.stale;
        expectedFragments[DefaultPartial]['3'].timestamp = ITimestamp.stale;
        expectedFragments[DefaultPartial]['3'].status = IStatus.stale;
        expectedFragments[MinimalPartial]['3'].timestamp = ITimestamp.stale;
        expectedFragments[MinimalPartial]['3'].status = IStatus.stale;
        expectedQueries['/projects'].timestamp = ITimestamp.stale;
        expectedQueries['/projects'].status = IStatus.stale;
        expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
        expectedQueries['/projects?filter=123'].status = IStatus.stale;
        expectedQueries['/projects/1'].timestamp = ITimestamp.stale;
        expectedQueries['/projects/1'].status = IStatus.stale;
        expectedQueries['/projects/2'].timestamp = ITimestamp.stale;
        expectedQueries['/projects/2'].status = IStatus.stale;
        expectedQueries['/projects/3'].timestamp = ITimestamp.stale;
        expectedQueries['/projects/3'].status = IStatus.stale;

        expect(fragmentCache).to.have.property('fragments')
          .that.deep.equals(expectedFragments);
        expect(fragmentCache).to.have.property('queries')
          .that.deep.equals(expectedQueries);
      });

      describe('with noFragments option specified', () => {
        it('should correctly invalidate cache', () => {
          fragmentCache.invalidate(null, {
            noFragments: true
          });

          expectedQueries['/projects'].timestamp = ITimestamp.stale;
          expectedQueries['/projects'].status = IStatus.stale;
          expectedQueries['/projects?filter=123'].timestamp = ITimestamp.stale;
          expectedQueries['/projects?filter=123'].status = IStatus.stale;
          expectedQueries['/projects/1'].timestamp = ITimestamp.stale;
          expectedQueries['/projects/1'].status = IStatus.stale;
          expectedQueries['/projects/2'].timestamp = ITimestamp.stale;
          expectedQueries['/projects/2'].status = IStatus.stale;
          expectedQueries['/projects/3'].timestamp = ITimestamp.stale;
          expectedQueries['/projects/3'].status = IStatus.stale;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('with noQueries option specified', () => {
        it('should correctly invalidate cache', () => {
          fragmentCache.invalidate(null, {
            noQueries: true
          });

          expectedFragments[DefaultPartial]['1'].timestamp = ITimestamp.stale;
          expectedFragments[DefaultPartial]['1'].status = IStatus.stale;
          expectedFragments[MinimalPartial]['1'].timestamp = ITimestamp.stale;
          expectedFragments[MinimalPartial]['1'].status = IStatus.stale;
          expectedFragments[DefaultPartial]['2'].timestamp = ITimestamp.stale;
          expectedFragments[DefaultPartial]['2'].status = IStatus.stale;
          expectedFragments[MinimalPartial]['2'].timestamp = ITimestamp.stale;
          expectedFragments[MinimalPartial]['2'].status = IStatus.stale;
          expectedFragments[DefaultPartial]['3'].timestamp = ITimestamp.stale;
          expectedFragments[DefaultPartial]['3'].status = IStatus.stale;
          expectedFragments[MinimalPartial]['3'].timestamp = ITimestamp.stale;
          expectedFragments[MinimalPartial]['3'].status = IStatus.stale;

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });
    });
  });
};
