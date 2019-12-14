
const app = require('../../src/app');
const mongoose = require('mongoose');
const env = require('../../src/env');
const supertest = require('supertest');
const request = supertest(app);
const VadlidationStatus = require('../../src/controllers/admincontroller').VadlidationStatus;
let adminObject = {
  username: 'hasank',
  email: 'hasankataya10@gmail.com',
  password: 'admin@123',
};
let verifier;
let token;
describe('Admin e2e tests', () => {
  beforeAll(async () => {
    delete require.cache[require.resolve('../../src/app')];
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

  function post(url, body) {
    const httpRequest = request.post(url);
    httpRequest.send(body);
    httpRequest.set('Accept', 'application/json');
    httpRequest.set('Origin', 'http://localhost:3000');
    httpRequest.set('authorization', 'Bearer ' + token + '');
    return httpRequest;
  }

  it('gets /admin endpoint', async done => {
    const response = await request.get('/admin');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Admin Page');
    done();
  });

  it('posts to /createProfile endpoint, Field is required', async done => {
    const response = await post('/admin/createProfile', { email: 'hasankataya10@gmail.com', password: 'admin@123' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('username is required');
    done();
  });

  it('posts to /createProfile endpoint, Field is invalid', async done => {
    const response = await post('/admin/createProfile', { email: 'hasankataya10@gmail.com', password: 'admin123', username: 'hasank' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.WongPassword);
    done();
  });

  it('posts to /createProfile endpoint, Succcessful', async done => {
    const response = await post('/admin/createProfile', adminObject);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).data.username).toBe(adminObject.username);
    verifier = JSON.parse(response.text).data.verifier;
    done();
  });

  it('posts to /createProfile endpoint,  username / email already taken ', async done => {
    const response = await post('/admin/createProfile', adminObject);
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.UsernameFound);
    done();
  });

  it('posts to /login endpoint, missing field', async done => {
    const response = await post('/admin/login', { password: 'admin@123' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('username or email is required');
    done();
  });

  it('posts to /login endpoint, invalid credentials', async done => {
    const response = await post('/admin/login', { password: 'admin123', username: 'hasank' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.InvalidCredentials);
    done();
  });

  it('posts to /login endpoint, account is not activated', async done => {
    const response = await post('/admin/login', adminObject);
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.NotActive);
    done();
  });

  it('get to /verifyEmail endpoint, invaild verifier', async done => {
    const response = await request.get(
      '/verification/verifyemail/?user=admin&email=' + adminObject.email + '&verifier=12345'
    );
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(
      'Email was not verified, since it doesn\'t exist or token expired, please send email to ' + process.env.email_user + '');
    done();
  });

  it('get to /verifyEmail endpoint, account successfully activated ', async done => {
    const response = await request.get(
      '/verification/verifyemail/?user=admin&email=' + adminObject.email + '&verifier=' + verifier + ''
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Email is successfully verified!');
    done();
  });

  it('get to /verifyEmail endpoint, account already activated ', async done => {
    const response = await request.get(
      '/verification/verifyemail/?user=admin&email=' + adminObject.email + '&verifier=' + verifier + ''
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('User already active');
    done();
  });

  it('posts to /login endpoint, login successful', async done => {
    const response = await post('/admin/login', adminObject);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Successfuly Logged In');
    token = JSON.parse(response.text).data.token;
    done();
  });

  it('get to /viewProfile endpoint, forbidden access ', async done => {
    const response = await request.get('/admin/viewProfile');
    expect(response.status).toBe(403);
    done();
  });

  it('get to /viewProfile endpoint, Successfully retrieved Profile', async done => {
    const response = await request.get('/admin/viewProfile').set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Successfully retrieved Profile');
    expect(JSON.parse(response.text).data.username).toBe(adminObject.username);
    done();
  });

  it('posts to /updateProfile endpoint, missing field', async done => {
    const response = await post('/admin/updateProfile', {});
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('at least one field is required to update account');
    done();
  });

  it('posts to /updateProfile endpoint, unallowed field change ', async done => {
    const response = await post('/admin/updateProfile', { username: 'hasank' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('username cannot be changed');
    done();
  });

  it('posts to /updateProfile endpoint, invalid field', async done => {
    const response = await post('/admin/updateProfile', { phonenumber: '12345fdfd' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.WrongPhone);
    done();
  });

  it('posts to /updateProfile endpoint, Successful Update', async done => {
    const response = await post('/admin/updateProfile', { phonenumber: '12345678' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Successfully Updated Profile');
    expect(JSON.parse(response.text).data.phonenumber).toBe('12345678');
    done();
  });

  it('posts to /updateProfile endpoint, email already exists ', async done => {
    const response = await post('/admin/updateProfile', { email: adminObject.email });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.EmailFound);
    done();
  });

  it('posts to /updateProfile endpoint, update email successful', async done => {
    const response = await post('/admin/updateProfile', { email: 'email@gmail.com' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Successfully Updated Profile');
    done();
  });

  it('posts to /createSkill endpoint, missing field', async done => {
    const response = await post('/admin/CreateSkill', { name: 'e2e testing' });
    expect(response.status).toBe(422);
    done();
  });

  it('posts to /createSkill endpoint,  successfully created skill', async done => {
    const response = await post('/admin/CreateSkill', { name: 'e2e testing', description: 'testing' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts to /createSkill endpoint, skill already exists', async done => {
    const response = await post('/admin/CreateSkill', { name: 'e2e testing', description: 'testing' });
    expect(response.status).toBe(400);
    done();
  });

  it('gets  /viewSkill endpoint, forbidden access', async done => {
    const response = await request.get('/admin/ViewSkill');
    expect(response.status).toBe(403);
    done();
  });

  it('gets  /viewSkill endpoint, skill sucessfully fetched', async done => {
    const response = await request.get('/admin/ViewSkill').set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts  /updateSkill endpoint, skill, fields required', async done => {
    const response = await post('/admin/UpdateSkill', { name: 'skill' }).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('skill description is required');
    done();
  });

  it('posts  /updateSkill endpoint, successful update', async done => {
    const response = await post('/admin/UpdateSkill', { name: 'e2e testing', description: 'test' }).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts  /deactivateSkill endpoint, field requires', async done => {
    const response = await post('/admin/DeactivateSkill', {}).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('skill name is required');
    done();
  });

  it('posts  /deactivateSkill endpoint, successful deactivation', async done => {
    const response = await post('/admin/DeactivateSkill', { name: 'e2e testing' }).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts  /deactivateSkill endpoint, already deactivated', async done => {
    const response = await post('/admin/DeactivateSkill', { name: 'e2e testing' }).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.SkillDeactivated);
    done();
  });

  it('posts  /reactivateSkill endpoint, field required', async done => {
    const response = await post('/admin/ReactivateSkill', {}).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('skill name is required');
    done();
  });

  it('posts  /reactivateSkill endpoint, successful activation', async done => {
    const response = await post('/admin/ReactivateSkill', { name: 'e2e testing' }).set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts to /createStatus endpoint, missing field', async done => {
    const response = await post('/admin/CreateStatus', {});
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('status name is required');
    done();
  });

  it('posts to /createStatus endpoint,  successfully created Status', async done => {
    const response = await post('/admin/CreateStatus', { name: 'public', description: 'publicly traded' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts to /createStatus endpoint, status already exists', async done => {
    const response = await post('/admin/CreateStatus', { name: 'public', description: 'publicly traded' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.StatusFound);
    done();
  });

  it('posts to /updateStatus endpoint, missing field', async done => {
    const response = await post('/admin/UpdateStatus', {});
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('status name is required');
    done();
  });

  it('posts to /updateStatus endpoint,  Status not found', async done => {
    const response = await post('/admin/UpdateStatus', { name: 'private', description: 'publicly traded' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.NotFound);
    done();
  });

  it('posts to /updateStatus endpoint,  successfully updated Status', async done => {
    const response = await post('/admin/UpdateStatus', { name: 'public', description: 'publicly traded' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts  /deactivateStatus endpoint, field required', async done => {
    const response = await post('/admin/DeactivateStatus', {});
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('status name is required');
    done();
  });

  it('posts  /deactivateStatus endpoint,  not found', async done => {
    const response = await post('/admin/DeactivateStatus', { name: 'private' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.NotFound);
    done();
  });

  it('posts  /deactivateStatus endpoint, successful deactivation', async done => {
    const response = await post('/admin/DeactivateStatus', { name: 'public' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts  /deactivateStatus endpoint, already deactivated', async done => {
    const response = await post('/admin/DeactivateStatus', { name: 'public' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.deactivated);
    done();
  });

  it('posts  /reactivateStatus endpoint, field required', async done => {
    const response = await post('/admin/ReactivateStatus', {});
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe('status name is required');
    done();
  });

  it('posts  /reactivateStatus endpoint, successful activation', async done => {
    const response = await post('/admin/ReactivateStatus', { name: 'public' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('gets  /viewStatus endpoint, forbidden access', async done => {
    const response = await request.get('/admin/ViewStatus');
    expect(response.status).toBe(403);
    done();
  });

  it('gets  /viewStatus endpoint, status sucessfully fetched', async done => {
    const response = await request.get('/admin/ViewStatus').set('authorization', 'Bearer ' + token + '');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    done();
  });

  it('posts to /createDeveloperStatus endpoint,  successfully created Status', async done => {
    const response = await post('/admin/createDeveloperStatus', { name: 'open', description: 'open for jobs' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeveloperStatusCreationSuccess);
    done();
  });

  it('posts to /createDeveloperStatus endpoint, status already exists', async done => {
    const response = await post('/admin/createDeveloperStatus', { name: 'open', description: 'open for jobs' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeveloperStatusAlreadyExists);
    done();
  });

  it('posts to /updateDeveloperStatus endpoint,  Status not found', async done => {
    const response = await post('/admin/updateDeveloperStatus', { name: 'not open', description: 'not open for jobs' });
    expect(response.status).toBe(404);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeveloperStatusNotFound);
    done();
  });

  it('posts to /updateDeveloperStatus endpoint,  successfully updated Status', async done => {
    const response = await post('/admin/updateDeveloperStatus', { name: 'open', description: 'not open for jobs' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.UpdateDeveloperStatusSuccess);
    done();
  });

  it('posts  /deactivateDeveloperStatus endpoint,  not found', async done => {
    const response = await post('/admin/deactivateDeveloperStatus', { name: 'private' });
    expect(response.status).toBe(404);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeveloperStatusNotFound);
    done();
  });

  it('posts  /deactivateDeveloperStatus endpoint, successful deactivation', async done => {
    const response = await post('/admin/deactivateDeveloperStatus', { name: 'open' });
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeactivateDeveloperStatusSucceeds);
    done();
  });

  it('posts  /deactivateDeveloperStatus endpoint, already deactivated', async done => {
    const response = await post('/admin/deactivateDeveloperStatus', { name: 'open' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.DeveloperStatusAlreadyDeactivated);
    done();
  });

  it('posts to /deactivateProfile endpoint, profile successfully deactivated', async done => {
    const response = await post('/admin/deactivateProfile', {});
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Profile Deactivated Successfully');
    done();
  });

});
