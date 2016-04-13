import { Random } from 'meteor/random';
import { Tasks } from '/imports/api/tasks.js';

Factory.define('task', Tasks, {
  owner: Random.id(),
  username: Fake.word(),
  checked: false,
  private: false,
  text: () => Fake.sentence(),
  createdAt: () => new Date(),
});
