// Loading Models into mongoose
require('../../src/models/Admin.js');
require('../../src/models/Skill.js');
require('../../src/models/Status.js');
const STRINGPASS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERPASS='0123456789';
import 'regenerator-runtime/runtime';
import Chance from 'chance';
const chance = new Chance();
/* eslint-disable require-jsdoc */
const {
  AdminController,
  VadlidationStatus,
} = require('../../src/controllers/admincontroller');
const MemoryaAdminPersister = require('../persistence/memoryadminpersister');
const {APIStatus} = require('../../src/models/classes/DevResponse');
const env=require('../../src/env');
const dbcontroller = new AdminController(new MemoryaAdminPersister());
const mongoose = require('mongoose');


beforeAll(async () => {
  await mongoose.connect(env.env.app.testdburl, {
    useNewUrlParser: true,
  });
});
async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
  await mongoose.connection.close();
}
afterAll(async () => {
  await removeAllCollections();
});
test('DB User Created Succesfully', (done) => {
  const password=chance.string({
    length: 9,
    pool: STRINGPASS, symbols: true,
  }) +chance.character({symbols: true})+chance.character({pool: NUMBERPASS});
  const admin = `{"email":"${chance.email()}", "password": "${password}", "username": "hasank", "phonenumber" : "1234567"}`;
  const promise = dbcontroller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('DB User Already Exists', (done) => {
  const password=chance.string({
    length: 9,
    pool: STRINGPASS, symbols: true,
  }) +chance.character({symbols: true})+chance.character({pool: NUMBERPASS});
  const admin = `{"email":"${chance.email()}", "password": "${password}", "username": "hasank", "phonenumber" : "1234567"}`;
  const promise = dbcontroller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UsernameFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('DB User Not Found', (done) => {
  const username = 'sawada';
  const updatedFields = {phonenumber: '11111111'};
  const promise = dbcontroller.updateAdmin(username, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('DB User Updated Succesfully', (done) => {
  const username = 'hasank';
  const updatedFields = {phonenumber: '11111111'};
  const promise = dbcontroller.updateAdmin(username, updatedFields);
  promise.then((response) => {
    expect(response.data.phonenumber).toBe(updatedFields.phonenumber);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('DB User Fetched Succesfully', (done) => {
  const username = 'hasank';
  const promise = dbcontroller.getAdmin(username);
  promise.then((response) => {
    expect(response.data.username).toBe(username);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('DB User Not Found Fetch', (done) => {
  const username = 'sawada';
  const promise = dbcontroller.getAdmin(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('DB User [Any User] Not Found', (done) => {
  const username = 'sawada';
  const type = 'admin';
  const promise = dbcontroller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('DB User [Any User] Deactivated Succesfully', (done) => {
  const username = 'hasank';
  const type = 'admin';
  const promise = dbcontroller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});
