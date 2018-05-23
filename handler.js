'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

const connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }

  console.log('=> using new database connection');
  return mongoose.connect(process.env.DB)
    .then(db => {
      isConnected = db.connections[0].readyState;
    });
};

const ConsentSchema = new mongoose.Schema({
  domain: String,
  email: String,
  time: Date
});
const Consent = mongoose.model('Consent', ConsentSchema);
/* eslint-disable no-param-reassign */

module.exports.create = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Consent.create(JSON.parse(event.body))
        .then(consent => callback(null, {
          statusCode: 200,
          body: JSON.stringify(consent)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the consent.'
        }));
    });
};
