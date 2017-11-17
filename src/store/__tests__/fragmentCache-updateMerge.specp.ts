/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import { stub } from 'sinon';

import {
  descriptorCollection,
  descriptorCollectionItem,
  descriptorFrom,
  descriptorResource
} from 'test/TestHelper';

import { FragmentCache } from '../../store/fragmentCache';
import RefraxConfig from '../../util/config';
import { extend } from '../../util/tools';
import { IStatus, IStrategy, ITimestamp } from '../../util/types';

// tslint:disable no-magic-numbers align

const DefaultPartial = RefraxConfig.defaultFragment;
const MinimalPartial = 'minimal';

const mockTimestamp = 1234567890;
const dataSegmentFull__ID_1 = {
  id: 1,
  title: 'Foo Project',
  description: 'This is the Foo project on wheels'
};
const dataSegmentFull__ID_3 = {
  id: 3,
  title: 'BarFoo Project',
  description: 'This is the BarFoo project on wheels'
};
const dataSegmentFull__ID_4 = {
  id: 4,
  title: 'FooBar Project',
  description: 'This is the FooBar project on wheels'
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
  title: 'BarFoo Project'
};
const dataSegmentPartial__ID_4 = {
  id: 4,
  title: 'FooBar Project'
};

const dataSegmentUpdated__ID_3 = {
  id: 3,
  description: 'This is the BarFoo project on rollerskates',
  label: 'BarFoo label'
};

const dataSegmentFull_Resource = {
  fooObject: {
    bar: 'data',
    foo: 321
  },
  option_1: 1,
  option_2: 2
};

const dataSegmentUpdated_Resource = {
  option_1: 321,
  option_3: 123
};

// tslint:disable-next-line:no-default-export
export default (): void => {
  describe('update with merge strategy', () => {
    let fragmentCache: FragmentCache;
    let expectedFragments: {[key: string]: any};
    let expectedQueries: {[key: string]: any};

    // eslint-disable-next-line no-undef
    before(() => {
      stub(Date, 'now').callsFake(() => mockTimestamp);
    });

    // eslint-disable-next-line no-undef
    after(() => {
      (Date.now as any).restore();
    });

    beforeEach(() => {
      fragmentCache = new FragmentCache();

      fragmentCache.update(descriptorCollection({
        path: '/other-projects',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_3, dataSegmentPartial__ID_4], IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/3'
      }), dataSegmentFull__ID_3, IStatus.complete);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/4'
      }), dataSegmentFull__ID_4, IStatus.complete);

      fragmentCache.update(descriptorFrom({
        path: '/other-resource'
      }), dataSegmentFull_Resource, IStatus.complete);

      expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
      expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
    });

    describe('when passed a descriptor', () => {
      describe('containing data', () => {
        describe('describing nothing', () => {
          describe('with no specified partial', () => {
            it('should not modify cache', () => {
              fragmentCache.update(descriptorFrom({
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }));

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', () => {
            it('should not modify cache', () => {
              fragmentCache.update(descriptorFrom({
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }));

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        // ============================================================================================
        describe('describing a collection resource', () => {
          describe('with invalid data', () => {
            it('should throw an error for non collection type data', () => {
              expect(() => {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), 123);
              }).to.throw(Error, 'expected collection compatible type of Array/Object');

              expect(() => {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), 'foobar');
              }).to.throw(Error, 'expected collection compatible type of Array/Object');
            });

            it('should throw an error for non id based item', () => {
              expect(() => {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), { foo: 'bar ' });
              }).to.throw(Error, 'could not resolve collection item id');
            });

            it('should throw an error for collection of non objects', () => {
              expect(() => {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), [123, 'foo']);
              }).to.throw(Error, 'expected collection item of type Object');
            });

            it('should throw an error for collection of objects with no id', () => {
              expect(() => {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), [{ foo: 'bar' }]);
              }).to.throw(Error, 'could not resolve collection item id');
            });
          });

          describe('with no specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[DefaultPartial]['2'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/other-projects',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[DefaultPartial]['2'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/other-projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['3', '4', '1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[MinimalPartial]['2'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/other-projects',
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[MinimalPartial]['2'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/other-projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['3', '4', '1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        // ============================================================================================
        describe('describing an id-resource', () => {
          describe('with no specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentFull__ID_1);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentFull__ID_1
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['1']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorCollectionItem({
                path: '/projects/3',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentUpdated__ID_3);

              expectedFragments[DefaultPartial]['3'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: extend({}, dataSegmentFull__ID_3, dataSegmentUpdated__ID_3)
              };
              expectedQueries['/projects/3'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: '3'
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentFull__ID_1);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentFull__ID_1
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: ['1']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorCollectionItem({
                path: '/projects/3',
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentUpdated__ID_3);

              expectedFragments[MinimalPartial]['3'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: extend({}, dataSegmentPartial__ID_3, dataSegmentUpdated__ID_3)
              };
              expectedQueries['/projects/3'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: '3'
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        // ============================================================================================
        describe('describing a resource', () => {
          describe('with no specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorResource({
                path: '/resource',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentFull_Resource);

              expectedQueries['/resource'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentFull_Resource
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorResource({
                path: '/other-resource',
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: extend({}, dataSegmentFull_Resource, dataSegmentUpdated_Resource)
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', () => {
            it('should add new cache data', () => {
              fragmentCache.update(descriptorResource({
                path: '/resource',
                partial: MinimalPartial
              }), dataSegmentFull_Resource);

              expectedQueries['/resource'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: dataSegmentFull_Resource
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', () => {
              fragmentCache.update(descriptorResource({
                path: '/other-resource',
                partial: MinimalPartial,
                cacheStrategy: IStrategy.merge,
                collectionStrategy: IStrategy.merge
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: IStatus.complete,
                data: extend({}, dataSegmentFull_Resource, dataSegmentUpdated_Resource)
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });
      });
    });

    // ============================================================================================
    // ============================================================================================

    describe('containing no data', () => {
      describe('describing nothing', () => {
        describe('with no specified partial', () => {
          it('should not modify cache', () => {
            fragmentCache.update(descriptorFrom({
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }));

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', () => {
          it('should not modify cache', () => {
            fragmentCache.update(descriptorFrom({
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }));

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      // ============================================================================================
      describe('describing a collection resource', () => {
        describe('with no specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorFrom({
              path: '/projects',
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorFrom({
              path: '/other-projects',
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/other-projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: ['3', '4']
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorFrom({
              path: '/projects',
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorFrom({
              path: '/other-projects',
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/other-projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: ['3', '4']
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      // ============================================================================================
      describe('describing an id-resource', () => {
        describe('with no specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorCollection({
              path: '/projects',
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.stale,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorCollectionItem({
              path: '/projects/3',
              id: 3,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedFragments[DefaultPartial]['3'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: dataSegmentFull__ID_3
            };
            expectedQueries['/projects/3'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: '3'
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorCollection({
              path: '/projects',
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/projects'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.stale,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorCollectionItem({
              path: '/projects/3',
              id: 3,
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedFragments[MinimalPartial]['3'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: dataSegmentPartial__ID_3
            };
            expectedQueries['/projects/3'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: '3'
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      // ============================================================================================
      describe('describing a resource', () => {
        describe('with no specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorResource({
              path: '/resource',
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/resource'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorResource({
              path: '/other-resource',
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/other-resource'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: dataSegmentFull_Resource
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', () => {
          it('should mark new cache data as stale', () => {
            fragmentCache.update(descriptorResource({
              path: '/resource',
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/resource'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', () => {
            fragmentCache.update(descriptorResource({
              path: '/other-resource',
              partial: MinimalPartial,
              cacheStrategy: IStrategy.merge,
              collectionStrategy: IStrategy.merge
            }), null);

            expectedQueries['/other-resource'] = {
              timestamp: ITimestamp.stale,
              status: IStatus.complete,
              data: dataSegmentFull_Resource
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });
    });
  });
};
