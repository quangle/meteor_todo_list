import angular from 'angular';
import angularMeteor from 'angular-meteor';
import template from './todosList.html';
import { Tasks } from '../../api/tasks.js';
import { Meteor } from 'meteor/meteor';

class TodosListCtrl {
  constructor($scope) {
    $scope.viewModel(this);
    this.subscribe('tasks', () => {
      return [Meteor.userId()];
    });
    this.hideCompleted = false;

    this.helpers({
      tasks() {
        const selector = {};

        // If hide completed is checked, filter tasks
        if (this.getReactively('hideCompleted')) {
          selector.checked = {
            $ne: true
          };
        }
        return Tasks.find(selector, {
          sort: {
            createdAt: -1
          }
        });
      }
    })
  }

  addTask(task) {
    Meteor.call('tasks.insert', task);
    $("#text-input").val("");
  }

  removeTask(task) {
    Meteor.call('tasks.remove', task._id);
  }

  setChecked(task) {
    Meteor.call('tasks.setChecked', task._id, !task.checked);
  }

  incompleteCount() {
    return Tasks.find({
      $and: [
        {
          checked: {
            $ne: true
          }
        },
        {
          owner: Meteor.userId()
        }
      ],

    }).count();
  }

  currentUser() {
    return Meteor.user();
  }

  setPrivate(task) {
    Meteor.call('tasks.setPrivate', task._id, !task.private);
  }
}

export default angular.module('todosList', [
  angularMeteor
])
.component('todosList', {
  templateUrl: 'imports/components/todosList/todosList.html',
  controller: ['$scope', TodosListCtrl]
});
