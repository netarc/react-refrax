/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const sinon = require('sinon');
const RefraxSchema = require('RefraxSchema');
const createSchemaCollection = require('createSchemaCollection');
const chai = require('chai');
const RefraxReact = require('RefraxReact');
const RefraxResource = require('RefraxResource');
const RefraxActionEntity = require('RefraxActionEntity');
const RefraxTools = require('RefraxTools');
const RefraxConstants = require('RefraxConstants');
const createAction = require('createAction');
const createContainer = RefraxReact.createContainer;
const expect = chai.expect;
const TIMESTAMP_LOADING = RefraxConstants.timestamp.loading;
const STATUS_STALE = RefraxConstants.status.stale;
const STATUS_COMPLETE = RefraxConstants.status.complete;

/* eslint-disable indent */
/* global mount mount_cleanup mount_init */
/* global mock_reset mock_get mock_post mock_put */
/* global delay_for delay_for_resource_request delay_for_action */

let schema = null;

const dataElement1 = { id: 1, name: 'foo bob' };
const dataElement2 = { id: 2, name: 'foo baz' };
const dataElement3 = { id: 3, name: 'foo zoo' };
const dataElement4 = { id: 3, name: 'john doe' };
const dataCollectionUsers1 = [
  dataElement1,
  dataElement2
];
const dataCollectionUsers2 = [
  dataElement1,
  dataElement3
];

const actionCreateUser = createAction(function(data) {
  return this
    .mutableFrom(schema.users)
    .create(data);
});

const actionUpdateUser = createAction(function(data) {
  return this
    .mutableFrom(schema.users.user)
    .update(data);
});

class TestComponent extends React.Component {
  // Place holders so we can spy into them
  componentWillMount() {
    this._renderPasses = [];
  }
  componentWillReceiveProps() {}

  render() {
    const pass = {};
    RefraxTools.each(this.props, (prop, key) => {
      if (prop instanceof RefraxResource) {
        pass[key] = {
          data: JSON.parse(JSON.stringify(prop.data || null)),
          status: prop.status,
          timestamp: prop.timestamp
        };
      }
    });
    this._renderPasses.push(pass);

    return React.createElement('div', null, 'TestComponent');
  }
}

const TestComponentContainer = createContainer(TestComponent, function() {
  return this.props.refrax || {};
});

describe('RefraxContainer', function() {
  const resetSpies = () => {
    TestComponentContainer.prototype.componentWillMount.reset();
    TestComponentContainer.prototype.render.reset();
    TestComponent.prototype.componentWillMount.reset();
    TestComponent.prototype.componentWillReceiveProps.reset();
    TestComponent.prototype.render.reset();
  };

  beforeEach(() => {
    mock_reset();
    mount_init();

    sinon.spy(TestComponentContainer.prototype, 'componentWillMount');
    sinon.spy(TestComponentContainer.prototype, 'render');
    sinon.spy(TestComponent.prototype, 'componentWillMount');
    sinon.spy(TestComponent.prototype, 'componentWillReceiveProps');
    sinon.spy(TestComponent.prototype, 'render');

    schema = new RefraxSchema();
    schema.addLeaf(createSchemaCollection('users'));

    mock_get('/users', dataCollectionUsers1);
    mock_get('/users/1', dataElement1);
    mock_get('/users/2', dataElement2);
    mock_get('/users/3', dataElement3);
  });

  afterEach(() => {
    TestComponentContainer.prototype.componentWillMount.restore();
    TestComponentContainer.prototype.render.restore();
    TestComponent.prototype.componentWillMount.restore();
    TestComponent.prototype.componentWillReceiveProps.restore();
    TestComponent.prototype.render.restore();

    mount_cleanup();
  });

  describe('wrapping a component', () => {
    it('should look correctly wrapped', () => {
      const wrapper = mount(React.createElement(TestComponentContainer, {}, null));

      expect(wrapper.node)
        .to.have.property('_disposers')
          .that.is.a('array');
      expect(wrapper.node)
        .to.have.property('_resources')
          .that.is.a('array');
      expect(wrapper.node)
        .to.have.property('_actions')
          .that.is.a('array');
      expect(wrapper.node)
        .to.have.property('_paramsUsed')
          .that.is.a('object');
      expect(wrapper.node.refs)
        .to.have.property('component')
          .that.is.an.instanceof(TestComponent);

      // refraxify superclass
      expect(wrapper.node.refs.component)
        .to.have.property('isLoading')
          .that.is.a('function');
      expect(wrapper.node.refs.component)
        .to.have.property('isPending')
          .that.is.a('function');
      expect(wrapper.node.refs.component)
        .to.have.property('hasData')
          .that.is.a('function');
      expect(wrapper.node.refs.component)
        .to.have.property('isStale')
          .that.is.a('function');
    });
  });

  describe('when attaching a Resource', () => {
    it('should correctly attach and propagate events', () => {
      const onLoad = sinon.spy();
      const onChange = sinon.spy();
      const wrapper = mount(React.createElement(TestComponentContainer, {
        refrax: {
          users: schema.users
        }
      }, null));

      expect(wrapper.node.state.attachments)
        .to.have.all.keys([
          'users'
        ])
        .to.deep.match({
          users: RefraxResource
        });

      const usersAttachment = wrapper.node.state.attachments.users;
      usersAttachment.subscribe('load', onLoad);
      usersAttachment.subscribe('change', onChange);

      expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
      expect(TestComponent.prototype.componentWillMount.callCount).to.equal(1);
      expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
      expect(TestComponent.prototype.render.callCount).to.equal(1);
      expect(onLoad.callCount).to.equal(0);
      expect(onChange.callCount).to.equal(0);

      // Wrapped component has correct resource state during render
      expect(wrapper.node.refs.component._renderPasses[0]).to.deep.equal({
        users: {
          data: null,
          status: STATUS_STALE,
          timestamp: TIMESTAMP_LOADING
        }
      });
      expect(wrapper.node.refs.component.isLoading()).to.equal(true);
      expect(wrapper.node.refs.component.isStale()).to.equal(true);
      expect(wrapper.node.refs.component.hasData()).to.equal(false);

      resetSpies();

      return delay_for_resource_request(usersAttachment)()
        .then(() => {
          expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
          expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
          expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
          expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TestComponent.prototype.render.callCount).to.equal(1);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(1);

          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[1]).to.deep.match({
            users: {
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
          expect(wrapper.node.refs.component.isLoading()).to.equal(false);
          expect(wrapper.node.refs.component.isStale()).to.equal(false);
          expect(wrapper.node.refs.component.hasData()).to.equal(true);

          resetSpies();
        })
        .then(delay_for())
        .then(() => {
          // Ensure we don't have any further erroneous propagations
          expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
          expect(TestComponentContainer.prototype.render.callCount).to.equal(0);
          expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
          expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TestComponent.prototype.render.callCount).to.equal(0);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(1);
        });
    });

    it('should correctly use parameters from component', () => {
      const wrapper = mount(React.createElement(TestComponentContainer, {
        userId: 1,
        refrax: {
          user: schema.users.user
        }
      }, null));

      const userAttachment = wrapper.node.state.attachments.user;
      return delay_for_resource_request(userAttachment)()
        .then(() => {
          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[1]).to.deep.match({
            user: {
              data: dataElement1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });

    it('should correctly use parameters from schema path', () => {
      const wrapper = mount(React.createElement(TestComponentContainer, {
        refrax: {
          user: schema.users.user.withParams({ userId: 2 })
        }
      }, null));

      const userAttachment = wrapper.node.state.attachments.user;
      return delay_for_resource_request(userAttachment)()
        .then(() => {
          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[1]).to.deep.match({
            user: {
              data: dataElement2,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });

    it('should correctly use parameters when supplied from both', () => {
      const wrapper = mount(React.createElement(TestComponentContainer, {
        userId: 1,
        refrax: {
          user: schema.users.user.withParams({ userId: 2 })
        }
      }, null));

      const userAttachment = wrapper.node.state.attachments.user;
      return delay_for_resource_request(userAttachment)()
        .then(() => {
          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[1]).to.deep.match({
            user: {
              data: dataElement2,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });

    it('should update and propagate properly when invalidated externally', () => {
      const onLoad = sinon.spy();
      const onChange = sinon.spy();
      const storeUsers = schema.__node.definition.storeMap.getOrCreate('user');
      const wrapper = mount(React.createElement(TestComponentContainer, {
        refrax: {
          users: schema.users
        }
      }, null));

      expect(wrapper.node.state.attachments)
        .to.have.all.keys([
          'users'
        ])
        .to.deep.match({
          users: RefraxResource
        });

      const usersAttachment = wrapper.node.state.attachments.users;
      usersAttachment.subscribe('load', onLoad);
      usersAttachment.subscribe('change', onChange);

      expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
      expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
      expect(TestComponent.prototype.render.callCount).to.equal(1);
      expect(onLoad.callCount).to.equal(0);
      expect(onChange.callCount).to.equal(0);

      resetSpies();

      return delay_for_resource_request(usersAttachment)()
        .then(() => {
          expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
          expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TestComponent.prototype.render.callCount).to.equal(1);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(1);

          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[1]).to.deep.match({
            users: {
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
          expect(wrapper.node.refs.component.isLoading()).to.equal(false);
          expect(wrapper.node.refs.component.isStale()).to.equal(false);
          expect(wrapper.node.refs.component.hasData()).to.equal(true);

          resetSpies();
          mock_get('/users', dataCollectionUsers2);
          storeUsers.invalidate();

          expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
          expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TestComponent.prototype.render.callCount).to.equal(1);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(2);

          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[2]).to.deep.match({
            users: {
              data: [],
              status: STATUS_STALE,
              timestamp: (val) => val == TIMESTAMP_LOADING
            }
          });
          expect(wrapper.node.refs.component.isLoading()).to.equal(true);
          expect(wrapper.node.refs.component.isStale()).to.equal(true);
          expect(wrapper.node.refs.component.hasData()).to.equal(true);

          resetSpies();
        })
        .then(delay_for_resource_request(usersAttachment))
        .then(() => {
          expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
          expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TestComponent.prototype.render.callCount).to.equal(1);
          expect(onLoad.callCount).to.equal(1);
          expect(onChange.callCount).to.equal(3);

          // Wrapped component has correct resource state during render
          expect(wrapper.node.refs.component._renderPasses[3]).to.deep.match({
            users: {
              data: dataCollectionUsers2,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
          expect(wrapper.node.refs.component.isLoading()).to.equal(false);
          expect(wrapper.node.refs.component.isStale()).to.equal(false);
          expect(wrapper.node.refs.component.hasData()).to.equal(true);
        });
    });
  });

  describe('when attaching a Action', () => {
    it('should correctly attach and propagate events', () => {
      const onStart = sinon.spy();
      const onFinish = sinon.spy();
      const wrapper = mount(React.createElement(TestComponentContainer, {
        refrax: {
          createUser: actionCreateUser
        }
      }, null));

      expect(wrapper.node.state.attachments)
        .to.have.all.keys([
          'createUser'
        ])
        .to.deep.match({
          createUser: RefraxActionEntity
        });

      const createUserAction = wrapper.node.state.attachments.createUser;
      createUserAction.subscribe('start', onStart);
      createUserAction.subscribe('finish', onFinish);

      expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
      expect(TestComponent.prototype.componentWillMount.callCount).to.equal(1);
      expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
      expect(TestComponent.prototype.render.callCount).to.equal(1);
      expect(onStart.callCount).to.equal(0);
      expect(onFinish.callCount).to.equal(0);
    });

    describe('when invoked', () => {
      it('should correctly propagate', () => {
        const onStart = sinon.spy();
        const onFinish = sinon.spy();
        const wrapper = mount(React.createElement(TestComponentContainer, {
          refrax: {
            createUser: actionCreateUser
          }
        }, null));

        expect(wrapper.node.state.attachments)
          .to.have.all.keys([
            'createUser'
          ])
          .to.deep.match({
            createUser: RefraxActionEntity
          });

        const createUserAction = wrapper.node.state.attachments.createUser;
        createUserAction.subscribe('start', onStart);
        createUserAction.subscribe('finish', onFinish);

        resetSpies();

        mock_post('/users', dataElement4);
        createUserAction({
          name: 'john doe'
        });

        expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
        expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
        expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
        expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
        expect(TestComponent.prototype.render.callCount).to.equal(1);
        expect(onStart.callCount).to.equal(1);
        expect(onFinish.callCount).to.equal(0);

        resetSpies();

        return delay_for_action(createUserAction)()
          .then(() => {
            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
            expect(TestComponent.prototype.render.callCount).to.equal(1);
            expect(onStart.callCount).to.equal(1);
            expect(onFinish.callCount).to.equal(1);

            resetSpies();
          })
          .then(delay_for())
          .then(() => {
            // Ensure we don't have any further erroneous propagations
            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
            expect(TestComponent.prototype.render.callCount).to.equal(0);
            expect(onStart.callCount).to.equal(1);
            expect(onFinish.callCount).to.equal(1);
          });
      });

      it('should correctly propagate to other containers', () => {
        const wrapperResource = mount(React.createElement(TestComponentContainer, {
          refrax: {
            users: schema.users
          }
        }, null));
        const wrapperAction = mount(React.createElement(TestComponentContainer, {
          refrax: {
            createUser: actionCreateUser
          }
        }, null));

        const usersAttachment = wrapperResource.node.state.attachments.users;
        const createUserAction = wrapperAction.node.state.attachments.createUser;

        expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(2);
        expect(TestComponentContainer.prototype.componentWillMount.thisValues).to.deep.equal([
          wrapperResource.node,
          wrapperAction.node
        ]);
        expect(TestComponentContainer.prototype.render.callCount).to.equal(2);
        expect(TestComponentContainer.prototype.render.thisValues).to.deep.equal([
          wrapperResource.node,
          wrapperAction.node
        ]);
        expect(TestComponent.prototype.componentWillMount.callCount).to.equal(2);
        expect(TestComponent.prototype.componentWillMount.thisValues).to.deep.equal([
          wrapperResource.node.refs.component,
          wrapperAction.node.refs.component
        ]);
        expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
        expect(TestComponent.prototype.render.callCount).to.equal(2);
        expect(TestComponent.prototype.render.thisValues).to.deep.equal([
          wrapperResource.node.refs.component,
          wrapperAction.node.refs.component
        ]);

        expect(wrapperResource.node.refs.component._renderPasses[0]).to.deep.match({
          users: {
            data: null,
            status: STATUS_STALE,
            timestamp: TIMESTAMP_LOADING
          }
        });

        resetSpies();

        return delay_for_resource_request(usersAttachment)()
          .then(() => {
            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(1);
            expect(TestComponentContainer.prototype.render.thisValues).to.deep.equal([
              wrapperResource.node
            ]);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(1);
            expect(TestComponent.prototype.componentWillReceiveProps.thisValues).to.deep.equal([
              wrapperResource.node.refs.component
            ]);
            expect(TestComponent.prototype.render.callCount).to.equal(1);
            expect(TestComponent.prototype.render.thisValues).to.deep.equal([
              wrapperResource.node.refs.component
            ]);

            expect(wrapperResource.node.refs.component._renderPasses[1]).to.deep.match({
              users: {
                data: dataCollectionUsers1,
                status: STATUS_COMPLETE,
                timestamp: (val) => val > TIMESTAMP_LOADING
              }
            });

            resetSpies();

            mock_post('/users', dataElement4);
            createUserAction({
              name: 'john doe'
            });

            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(2);
            expect(TestComponentContainer.prototype.render.thisValues).to.deep.equal([
              wrapperAction.node,
              wrapperResource.node
            ]);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(2);
            expect(TestComponent.prototype.componentWillReceiveProps.thisValues).to.deep.equal([
              wrapperAction.node.refs.component,
              wrapperResource.node.refs.component
            ]);
            expect(TestComponent.prototype.render.callCount).to.equal(2);
            expect(TestComponent.prototype.render.thisValues).to.deep.equal([
              wrapperAction.node.refs.component,
              wrapperResource.node.refs.component
            ]);

            expect(wrapperResource.node.refs.component._renderPasses[2]).to.deep.match({
              users: {
                data: dataCollectionUsers1,
                status: STATUS_COMPLETE,
                timestamp: TIMESTAMP_LOADING
              }
            });

            resetSpies();
          })
          .then(delay_for_action(createUserAction))
          .then(() => {
            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(2);
            expect(TestComponentContainer.prototype.render.thisValues).to.deep.equal([
              wrapperResource.node,
              wrapperAction.node
            ]);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(2);
            expect(TestComponent.prototype.componentWillReceiveProps.thisValues).to.deep.equal([
              wrapperResource.node.refs.component,
              wrapperAction.node.refs.component
            ]);
            expect(TestComponent.prototype.render.callCount).to.equal(2);
            expect(TestComponent.prototype.render.thisValues).to.deep.equal([
              wrapperResource.node.refs.component,
              wrapperAction.node.refs.component
            ]);

            expect(wrapperResource.node.refs.component._renderPasses[3]).to.deep.match({
              users: {
                data: dataCollectionUsers1,
                status: STATUS_COMPLETE,
                timestamp: (val) => val > TIMESTAMP_LOADING
              }
            });

            resetSpies();
          })
          .then(delay_for())
          .then(() => {
            expect(TestComponentContainer.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponentContainer.prototype.render.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillMount.callCount).to.equal(0);
            expect(TestComponent.prototype.componentWillReceiveProps.callCount).to.equal(0);
            expect(TestComponent.prototype.render.callCount).to.equal(0);
          });
      });
    });

    it('should correctly use parameters from component', () => {
      const wrapperResource = mount(React.createElement(TestComponentContainer, {
        refrax: {
          users: schema.users
        }
      }, null));
      const wrapperAction = mount(React.createElement(TestComponentContainer, {
        userId: 1,
        refrax: {
          updateUser: actionUpdateUser
        }
      }, null));

      const usersAttachment = wrapperResource.node.state.attachments.users;
      const updateUserAction = wrapperAction.node.state.attachments.updateUser;

      expect(wrapperResource.node.refs.component._renderPasses[0]).to.deep.match({
        users: {
          data: null,
          status: STATUS_STALE,
          timestamp: TIMESTAMP_LOADING
        }
      });

      return delay_for_resource_request(usersAttachment)()
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses[1]).to.deep.match({
            users: {
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });

          mock_put('/users/1', { id: 1, name: 'john doe' });
          return updateUserAction({
            name: 'john doe'
          });
        })
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses.length).to.equal(3);
          expect(wrapperResource.node.refs.component._renderPasses[2]).to.deep.match({
            users: {
              data: [
                { id: 1, name: 'john doe' },
                dataElement2
              ],
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });

    it('should correctly use parameters from action', () => {
      const wrapperResource = mount(React.createElement(TestComponentContainer, {
        refrax: {
          users: schema.users
        }
      }, null));
      const wrapperAction = mount(React.createElement(TestComponentContainer, {
        refrax: {
          updateUser: actionUpdateUser.withParams({ userId: 1 })
        }
      }, null));

      const usersAttachment = wrapperResource.node.state.attachments.users;
      const updateUserAction = wrapperAction.node.state.attachments.updateUser;

      expect(wrapperResource.node.refs.component._renderPasses[0]).to.deep.match({
        users: {
          data: null,
          status: STATUS_STALE,
          timestamp: TIMESTAMP_LOADING
        }
      });

      return delay_for_resource_request(usersAttachment)()
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses[1]).to.deep.match({
            users: {
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });

          mock_put('/users/1', { id: 1, name: 'john doe' });

          return updateUserAction({
            name: 'john doe'
          });
        })
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses.length).to.equal(3);
          expect(wrapperResource.node.refs.component._renderPasses[2]).to.deep.match({
            users: {
              data: [
                { id: 1, name: 'john doe' },
                dataElement2
              ],
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });

    it('should correctly use parameters when supplied from both', () => {
      const wrapperResource = mount(React.createElement(TestComponentContainer, {
        refrax: {
          users: schema.users
        }
      }, null));
      const wrapperAction = mount(React.createElement(TestComponentContainer, {
        userId: 2,
        refrax: {
          updateUser: actionUpdateUser.withParams({ userId: 1 })
        }
      }, null));

      const usersAttachment = wrapperResource.node.state.attachments.users;
      const updateUserAction = wrapperAction.node.state.attachments.updateUser;

      expect(wrapperResource.node.refs.component._renderPasses[0]).to.deep.match({
        users: {
          data: null,
          status: STATUS_STALE,
          timestamp: TIMESTAMP_LOADING
        }
      });

      return delay_for_resource_request(usersAttachment)()
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses[1]).to.deep.match({
            users: {
              data: dataCollectionUsers1,
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });

          mock_put('/users/1', { id: 1, name: 'john doe' });

          return updateUserAction({
            name: 'john doe'
          });
        })
        .then(() => {
          expect(wrapperResource.node.refs.component._renderPasses.length).to.equal(3);
          expect(wrapperResource.node.refs.component._renderPasses[2]).to.deep.match({
            users: {
              data: [
                { id: 1, name: 'john doe' },
                dataElement2
              ],
              status: STATUS_COMPLETE,
              timestamp: (val) => val > TIMESTAMP_LOADING
            }
          });
        });
    });
  });
});
