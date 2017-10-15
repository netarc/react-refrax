/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { expect } from 'chai';
import sinon from 'sinon';
import {
  descriptorFrom,
  descriptorResource,
  descriptorCollection,
  descriptorCollectionItem
} from 'TestHelper';
import RefraxConstants from 'RefraxConstants';
import RefraxFragmentCache from 'RefraxFragmentCache';

const DefaultPartial = RefraxConstants.defaultFragment;
const MinimalPartial = 'minimal';
const STATUS_COMPLETE = RefraxConstants.status.complete;
const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;


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

export default function() {
  describe('update with replace strategy', function() {
    var fragmentCache, expectedFragments, expectedQueries;

    // eslint-disable-next-line no-undef
    before(function() {
      sinon.stub(Date, 'now').callsFake(() => {
        return mockTimestamp;
      });
    });

    // eslint-disable-next-line no-undef
    after(function() {
      Date.now.restore();
    });

    beforeEach(function() {
      fragmentCache = new RefraxFragmentCache();

      fragmentCache.update(descriptorCollection({
        path: '/other-projects',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_3, dataSegmentPartial__ID_4], STATUS_COMPLETE);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/3'
      }), dataSegmentFull__ID_3, STATUS_COMPLETE);
      fragmentCache.update(descriptorCollectionItem({
        path: '/projects/4'
      }), dataSegmentFull__ID_4, STATUS_COMPLETE);

      fragmentCache.update(descriptorResource({
        path: '/other-resource'
      }), dataSegmentFull_Resource, STATUS_COMPLETE);

      expectedFragments = JSON.parse(JSON.stringify(fragmentCache.fragments));
      expectedQueries = JSON.parse(JSON.stringify(fragmentCache.queries));
    });

    describe('when passed a descriptor', function() {
      describe('containing data', function() {
        describe('describing nothing', function() {
          describe('with no specified partial', function() {
            it('should not modify cache', function() {
              fragmentCache.update(descriptorFrom({}));

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should not modify cache', function() {
              fragmentCache.update(descriptorFrom({
                partial: MinimalPartial
              }));

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        // ============================================================================================
        describe('describing a collection resource', function() {
          describe('with invalid data', function() {
            it('should throw an error for non collection type data', function() {
              expect(function() {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), 123);
              }).to.throw(TypeError, 'expected collection compatible type of Array/Object');

              expect(function() {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), 'foobar');
              }).to.throw(TypeError, 'expected collection compatible type of Array/Object');
            });

            it('should throw an error for non id based item', function() {
              expect(function() {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), {foo: 'bar'});
              }).to.throw(TypeError, 'could not resolve collection item id');
            });

            it('should throw an error for collection of non objects', function() {
              expect(function() {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), [123, 'foo']);
              }).to.throw(TypeError, 'expected collection item of type Object');
            });

            it('should throw an error for collection of objects with no id', function() {
              expect(function() {
                fragmentCache.update(descriptorCollection({
                  path: '/projects'
                }), [{foo: 'bar'}]);
              }).to.throw(TypeError, 'could not resolve collection item id');
            });
          });

          describe('with no specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/projects'
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[DefaultPartial]['2'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/other-projects'
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[DefaultPartial]['2'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/other-projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                partial: MinimalPartial
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[MinimalPartial]['2'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/other-projects',
                partial: MinimalPartial
              }), [dataSegmentPartial__ID_1, dataSegmentPartial__ID_2]);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_1
              };
              expectedFragments[MinimalPartial]['2'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentPartial__ID_2
              };
              expectedQueries['/other-projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });
        });

        // ============================================================================================
        describe('describing an id-resource', function() {
          describe('with no specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/projects'
              }), dataSegmentFull__ID_1);

              expectedFragments[DefaultPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentFull__ID_1
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorCollectionItem({
                path: '/projects/3'
              }), dataSegmentUpdated__ID_3);

              expectedFragments[DefaultPartial]['3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentUpdated__ID_3
              };
              expectedQueries['/projects/3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: '3'
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorCollection({
                path: '/projects',
                partial: MinimalPartial
              }), dataSegmentFull__ID_1);

              expectedFragments[MinimalPartial]['1'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentFull__ID_1
              };
              expectedQueries['/projects'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: ['1']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorCollectionItem({
                path: '/projects/3',
                partial: MinimalPartial
              }), dataSegmentUpdated__ID_3);

              expectedFragments[MinimalPartial]['3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentUpdated__ID_3
              };
              expectedQueries['/projects/3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
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
        describe('describing a resource', function() {
          describe('with no specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorResource({
                path: '/resource'
              }), dataSegmentFull_Resource);

              expectedQueries['/resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentFull_Resource
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorResource({
                path: '/other-resource'
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentUpdated_Resource
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(descriptorResource({
                path: '/resource',
                partial: MinimalPartial
              }), dataSegmentFull_Resource);

              expectedQueries['/resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentFull_Resource
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });

            it('should update existing cache data', function() {
              fragmentCache.update(descriptorResource({
                path: '/other-resource',
                partial: MinimalPartial
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: dataSegmentUpdated_Resource
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

    describe('containing no data', function() {
      describe('describing nothing', function() {
        describe('with no specified partial', function() {
          it('should not modify cache', function() {
            fragmentCache.update(descriptorFrom({}));

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', function() {
          it('should not modify cache', function() {
            fragmentCache.update(descriptorFrom({
              partial: MinimalPartial
            }));

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });
      });

      // ============================================================================================
      describe('describing a collection resource', function() {
        describe('with no specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorFrom({
              path: '/projects'
            }), null);

            expectedQueries['/projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorFrom({
              path: '/other-projects'
            }), null);

            expectedQueries['/other-projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: ['3', '4']
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorFrom({
              path: '/projects',
              partial: MinimalPartial
            }), null);

            expectedQueries['/projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorFrom({
              path: '/other-projects',
              partial: MinimalPartial
            }), null);

            expectedQueries['/other-projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
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
      describe('describing an id-resource', function() {
        describe('with no specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorCollection({
              path: '/projects'
            }), null);

            expectedQueries['/projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_STALE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorCollectionItem({
              path: '/projects/3',
              id: 3
            }), null);

            expectedFragments[DefaultPartial]['3'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: dataSegmentFull__ID_3
            };
            expectedQueries['/projects/3'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: '3'
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorCollection({
              path: '/projects',
              partial: MinimalPartial
            }), null);

            expectedQueries['/projects'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_STALE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorCollectionItem({
              path: '/projects/3',
              id: 3,
              partial: MinimalPartial
            }), null);

            expectedFragments[MinimalPartial]['3'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: dataSegmentPartial__ID_3
            };
            expectedQueries['/projects/3'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
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
      describe('describing a resource', function() {
        describe('with no specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorResource({
              path: '/resource'
            }), null);

            expectedQueries['/resource'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorResource({
              path: '/other-resource'
            }), null);

            expectedQueries['/other-resource'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: dataSegmentFull_Resource
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', function() {
          it('should mark new cache data as stale', function() {
            fragmentCache.update(descriptorResource({
              path: '/resource',
              partial: MinimalPartial
            }), null);

            expectedQueries['/resource'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
              data: undefined
            };

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });

          it('should mark existing cache data as stale', function() {
            fragmentCache.update(descriptorResource({
              path: '/other-resource',
              partial: MinimalPartial
            }), null);

            expectedQueries['/other-resource'] = {
              timestamp: TIMESTAMP_STALE,
              status: STATUS_COMPLETE,
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
}
