/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';

import { FragmentCache } from 'store/fragmentCache';
import {
  descriptorCollection,
  descriptorCollectionItem,
  descriptorFrom
} from 'test/TestHelper';
import RefraxConfig from 'util/config';
import { IStatus } from 'util/types';

// tslint:disable no-magic-numbers align

const DefaultPartial = RefraxConfig.defaultFragment;

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

// tslint:disable-next-line:no-default-export
export default (): void => {
  describe('touch', () => {
    let fragmentCache: FragmentCache;

    beforeEach(() => {
      fragmentCache = new FragmentCache();
    });

    describe('when passed a descriptor', () => {
      let expectedFragments: {[key: string]: any};
      let expectedQueries: {[key: string]: any};

      beforeEach(() => {
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

        expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
        expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
      });

      describe('describing nothing', () => {
        it('should not touch data', () => {
          fragmentCache.touch(descriptorFrom({}));

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('alongside no touch data', () => {
        it('should not touch data', () => {
          fragmentCache.touch(descriptorFrom({
            path: '/projects'
          }));
          fragmentCache.touch(descriptorFrom({
            path: '/projects',
            partial: 'minimal'
          }));
          fragmentCache.touch(descriptorFrom({
            path: '/projects/1'
          }));

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing an existing collection', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorFrom({
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

      describe('describing an existing id-resource by path', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorCollectionItem({
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

      describe('describing an existing id-resource by id', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorCollectionItem({
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

      describe('describing a non-existing collection', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorCollection({
            path: '/foobars'
          }), {
            timestamp: 1234
          });

          expectedQueries['/foobars'] = { timestamp: 1234 };

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by path', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorCollectionItem({
            path: '/projects/11'
          }), {
            timestamp: 1234
          });

          expectedQueries['/projects/11'] = { timestamp:  1234 };

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });

      describe('describing a non-existing id-resource by id', () => {
        it('should update cache', () => {
          fragmentCache.touch(descriptorCollectionItem({
            id: '11'
          }), {
            timestamp: 1234
          });

          expectedFragments[DefaultPartial]['11'] = { timestamp: 1234 };

          expect(fragmentCache).to.have.property('fragments')
            .that.deep.equals(expectedFragments);
          expect(fragmentCache).to.have.property('queries')
            .that.deep.equals(expectedQueries);
        });
      });
    });
  });
};
