import 'angular-mocks';
import { Meteor } from 'meteor/meteor';
import todosList from '../todosList';
import { Tasks } from '/imports/api/tasks.js';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { stubs } from 'meteor/practicalmeteor:sinon';

describe('todosList', function() {
  var element;

  beforeEach(function() {
    var $compile;
    var $rootScope;

    window.module(todosList.name);

    inject(function(_$compile_, _$rootScope_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    });

    element = $compile('<todos-list></todos-list>')($rootScope.$new(true));
    $rootScope.$digest();
  });

  describe('component', function() {
    it('should be showing incomplete tasks count', function() {
      assert.include(element[0].querySelector('p').innerHTML, '0');
    });
  });

  describe('controller', function() {
    var controller;
    beforeEach(() => {
      sinon.stub(Meteor, 'call');
      controller = element.controller('todosList');
    });

    afterEach(() => {
      Meteor.call.restore();
    });

    describe('addTask', function() {
      var newTask = 'Be more fabolous';

      beforeEach(() => {
        controller.addTask(newTask);
      });

      it('should call tasks.insert method', function() {
        sinon.assert.calledOnce(Meteor.call);
        sinon.assert.calledWith(Meteor.call, 'tasks.insert', newTask);
      });
    });

    describe('removeTask', function() {
      var task = { _id: "abc" };

      beforeEach(() => {
        controller.removeTask(task);
      });

      it('should call tasks.remove method', function() {
        sinon.assert.calledOnce(Meteor.call);
        sinon.assert.calledWith(Meteor.call, 'tasks.remove', task._id);
      });
    });

    describe('setChecked', function() {
      var task = { _id: "abc", checked: true };

      beforeEach(() => {
        controller.setChecked(task);
      });

      it('should call tasks.setChecked method', function() {
        sinon.assert.calledOnce(Meteor.call);
        sinon.assert.calledWith(Meteor.call, 'tasks.setChecked', task._id, false);
      });
    });

    describe('setPrivate', function() {
      var task = { _id: "abc", private: false };

      beforeEach(() => {
        controller.setPrivate(task);
      });

      it('should call tasks.setPrivate method', function() {
        sinon.assert.calledOnce(Meteor.call);
        sinon.assert.calledWith(Meteor.call, 'tasks.setPrivate', task._id, true);
      });
    });

    describe('currentUser', function() {
      beforeEach(() => {
        stubs.create('user', Meteor, 'user');
        stubs.user.returns("abc");
      });

      afterEach(() => {
        stubs.restoreAll();
      });

      it('return Meteor.user()', function() {
        assert.equal(controller.currentUser(), "abc");
      });
    });
  });
})
