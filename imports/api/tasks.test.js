import { Meteor } from 'meteor/meteor';
import { Tasks } from './tasks.js';
import { assert } from 'meteor/practicalmeteor:chai';
import { expect } from 'meteor/practicalmeteor:chai';
import { stubs } from 'meteor/practicalmeteor:sinon';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import {  } from '../factories/tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {
    let task;
    let userId;
    let userName;
    beforeEach(() => {
      resetDatabase();
      task = Factory.create('task');
      userId = task.owner;
      userName = "quang le";
      stubs.create('userId', Meteor, 'userId');
      stubs.userId.returns(userId);
      stubs.create('user', Meteor, 'user');
      stubs.user.returns({username: userName});
    });

    afterEach(() => {
      stubs.restoreAll();
    });

    describe('tasks.remove', () => {
      const deleteTask = Meteor.server.method_handlers['tasks.remove'];
      const invocation = {
        userId
      };

      describe('owned task', () => {
        it('deletes owned task', () => {
          deleteTask.apply(invocation, [task._id]);
          assert.equal(Tasks.find().count(), 0);
        });
      });

      describe('task is private and not owned by current user', () => {
        beforeEach(() => {
          anotherTask = Factory.create('task', { private: true, owner: "another"});
        });

        it('does not delete not owned task', () => {
          expect(function () {
            deleteTask.apply(invocation, [anotherTask._id]);
          }).to.throw(Meteor.Error('not-authorized'));
          assert.equal(Tasks.find().count(), 2);
        });
      });
    });

    describe('tasks.setChecked', () => {
      it('sets checked attribute', () => {
        const setCheckedTask = Meteor.server.method_handlers['tasks.setChecked'];
        const invocation = {
          userId
        };
        setCheckedTask.apply(invocation, [task._id, true]);
        assert.equal(Tasks.findOne(task._id).checked, true);
      });
    });

    describe('tasks.setPrivate', () => {
      const setPrivateTask = Meteor.server.method_handlers['tasks.setPrivate'];
      const invocation = {
        userId
      };
      describe('task is not private', () => {
        it('sets private attribute', () => {
          setPrivateTask.apply(invocation, [task._id, true]);

          assert.equal(Tasks.findOne(task._id).private, true);
        });
      });

      describe('task is private and not owned by current user', () => {
        beforeEach(() => {
          anotherTask = Factory.create('task', { private: true, owner: "another"});
        });
        it('does not set private attribute', () => {
          expect( function() {
            setPrivateTask.apply(invocation, [anotherTask._id, false]);
          }).to.throw(Meteor.Error('not-authorized'));
        });
      });
    });

    describe('tasks.insert', () => {
      const insertTask = Meteor.server.method_handlers['tasks.insert'];
      const invocation = {
        userId
      };
      describe('current user is present', () => {
        it('creates a new task', () => {
          insertTask.apply(invocation, ["text"]);

          const lastTask = Tasks.findOne({}, {sort: {createdAt: -1, limit: 1}});

          assert.equal(Tasks.find().count(), 2);
          assert.equal(lastTask.text, "text");
          assert.equal(lastTask.owner, userId);
          assert.equal(lastTask.username, userName);
        });
      });

      describe('current user is not present', () => {
        beforeEach(() => {
          stubs.create('userId', Meteor, 'userId');
          stubs.userId.returns(undefined);
        });
        it('throws not-authorized error', () => {
          expect(function () {
            insertTask.apply(invocation, ["text"]);
          }).to.throw(Meteor.Error('not-authorized'));

          assert.equal(Tasks.find().count(), 1);
        });
      });
    });
  });
}
