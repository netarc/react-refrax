/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const chai = require('chai');
const sinon = require('sinon');
const TestHelper = require('TestHelper');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const RefraxFragmentCache = require('RefraxFragmentCache');
const expect = chai.expect;
const DefaultPartial = RefraxConstants.defaultFragment;
const MinimalPartial = 'minimal';
const STATUS_COMPLETE = RefraxConstants.status.complete;
const STATUS_STALE = RefraxConstants.status.stale;
const TIMESTAMP_STALE = RefraxConstants.timestamp.stale;
const STRATEGY_MERGE = RefraxConstants.strategy.merge;


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
  describe('update with merge strategy', function() {
    var fragmentCache, expectedFragments, expectedQueries;

    // eslint-disable-next-line no-undef
    before(function() {
      sinon.stub(Date, 'now', function() {
        return mockTimestamp;
      });
    });

    // eslint-disable-next-line no-undef
    after(function() {
      Date.now.restore();
    });

    beforeEach(function() {
      fragmentCache = new RefraxFragmentCache();

      fragmentCache.update(TestHelper.descriptorCollection({
        path: '/other-projects',
        partial: MinimalPartial
      }), [dataSegmentPartial__ID_3, dataSegmentPartial__ID_4], STATUS_COMPLETE);
      fragmentCache.update(TestHelper.descriptorCollectionItem({
        path: '/projects/3'
      }), dataSegmentFull__ID_3, STATUS_COMPLETE);
      fragmentCache.update(TestHelper.descriptorCollectionItem({
        path: '/projects/4'
      }), dataSegmentFull__ID_4, STATUS_COMPLETE);

      fragmentCache.update(TestHelper.descriptorFrom({
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
              fragmentCache.update(TestHelper.descriptorFrom({
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
              }));

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should not modify cache', function() {
              fragmentCache.update(TestHelper.descriptorFrom({
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
                fragmentCache.update(TestHelper.descriptorCollection({
                  path: '/projects'
                }), 123);
              }).to.throw(TypeError, 'expected collection compatible type of Array/Object');

              expect(function() {
                fragmentCache.update(TestHelper.descriptorCollection({
                  path: '/projects'
                }), 'foobar');
              }).to.throw(TypeError, 'expected collection compatible type of Array/Object');
            });

            it('should throw an error for non id based item', function() {
              expect(function() {
                fragmentCache.update(TestHelper.descriptorCollection({
                  path: '/projects'
                }), {foo: 'bar'});
              }).to.throw(TypeError, 'could not resolve collection item id');
            });

            it('should throw an error for collection of non objects', function() {
              expect(function() {
                fragmentCache.update(TestHelper.descriptorCollection({
                  path: '/projects'
                }), [123, 'foo']);
              }).to.throw(TypeError, 'expected collection item of type Object');
            });

            it('should throw an error for collection of objects with no id', function() {
              expect(function() {
                fragmentCache.update(TestHelper.descriptorCollection({
                  path: '/projects'
                }), [{foo: 'bar'}]);
              }).to.throw(TypeError, 'could not resolve collection item id');
            });
          });

          describe('with no specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/projects',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/other-projects',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
                data: ['3', '4', '1', '2']
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/projects',
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/other-projects',
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
        describe('describing an id-resource', function() {
          describe('with no specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/projects',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
              fragmentCache.update(TestHelper.descriptorCollectionItem({
                path: '/projects/3',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
              }), dataSegmentUpdated__ID_3);

              expectedFragments[DefaultPartial]['3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: RefraxTools.extend({}, dataSegmentFull__ID_3, dataSegmentUpdated__ID_3)
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
              fragmentCache.update(TestHelper.descriptorCollection({
                path: '/projects',
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
              fragmentCache.update(TestHelper.descriptorCollectionItem({
                path: '/projects/3',
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
              }), dataSegmentUpdated__ID_3);

              expectedFragments[MinimalPartial]['3'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: RefraxTools.extend({}, dataSegmentPartial__ID_3, dataSegmentUpdated__ID_3)
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
              fragmentCache.update(TestHelper.descriptorResource({
                path: '/resource',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
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
              fragmentCache.update(TestHelper.descriptorResource({
                path: '/other-resource',
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: RefraxTools.extend({}, dataSegmentFull_Resource, dataSegmentUpdated_Resource)
              };

              expect(fragmentCache).to.have.property('fragments')
                .that.deep.equals(expectedFragments);
              expect(fragmentCache).to.have.property('queries')
                .that.deep.equals(expectedQueries);
            });
          });

          describe('with a specified partial', function() {
            it('should add new cache data', function() {
              fragmentCache.update(TestHelper.descriptorResource({
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
              fragmentCache.update(TestHelper.descriptorResource({
                path: '/other-resource',
                partial: MinimalPartial,
                cacheStrategy: STRATEGY_MERGE,
                collectionStrategy: STRATEGY_MERGE
              }), dataSegmentUpdated_Resource);

              expectedQueries['/other-resource'] = {
                timestamp: mockTimestamp,
                status: STATUS_COMPLETE,
                data: RefraxTools.extend({}, dataSegmentFull_Resource, dataSegmentUpdated_Resource)
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
            fragmentCache.update(TestHelper.descriptorFrom({
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
            }));

            expect(fragmentCache).to.have.property('fragments')
              .that.deep.equals(expectedFragments);
            expect(fragmentCache).to.have.property('queries')
              .that.deep.equals(expectedQueries);
          });
        });

        describe('with a specified partial', function() {
          it('should not modify cache', function() {
            fragmentCache.update(TestHelper.descriptorFrom({
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorFrom({
              path: '/projects',
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorFrom({
              path: '/other-projects',
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorFrom({
              path: '/projects',
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorFrom({
              path: '/other-projects',
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorCollection({
              path: '/projects',
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorCollectionItem({
              path: '/projects/3',
              id: 3,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorCollection({
              path: '/projects',
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorCollectionItem({
              path: '/projects/3',
              id: 3,
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorResource({
              path: '/resource',
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorResource({
              path: '/other-resource',
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorResource({
              path: '/resource',
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
            fragmentCache.update(TestHelper.descriptorResource({
              path: '/other-resource',
              partial: MinimalPartial,
              cacheStrategy: STRATEGY_MERGE,
              collectionStrategy: STRATEGY_MERGE
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
