'use strict';

module.exports = {
  generateRandomData
};

// Make sure to "npm install faker" first.
const Faker = require('faker');

function generateRandomData(userContext, events, done) {
  // generate data with Faker:
  const id = Faker.random.number({
    'min': 0,
    'max': 9999999});
  const recent_views = Faker.random.number({
    'min': 1,
    'max': 100000
  });
  // add variables to virtual user's context:
  userContext.vars.id = id;
  userContext.vars.views = recent_views;
  // continue with executing the scenario:
  return done();
}