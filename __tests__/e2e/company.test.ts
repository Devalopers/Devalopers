const app = require('../../src/app');
const mongoose = require('mongoose');
const env = require('../../src/env');
const supertest = require('supertest');
const VadlidationStatus = require('../../src/controllers/companycontroller.js').VadlidationStatus;
const request = supertest(app);
const companyObject = {
  username: 'sawada',
  email: 'sami.awd@outlook.com',
  password: 'company@123',
  CompanyIndustry: 'software',
  CompanyWebsite: 'www.ss.com',
};
let jobObj = {
  id: '',
  JobTitle: 'CTO',
  Email: 'ssami@sss.com',
};

let projectObj = {
  id: '',
  ProjectTitle: 'Freelancing',
  ProjectLength: 27,
  ProjectDescription: "It's complicated",
  YearsOfExperience: '0-2',
  Skills: 'java',
  Email: 'ssami@sss.com',
};
function post(url, body) {
  const httpRequest = request.post(url);
  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', 'http://localhost:3002');
  httpRequest.set('authorization', 'Bearer ' + tokenc + '');
  return httpRequest;
}
let verifier;
let tokenc;
describe('Company e2e tests', () => {
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
    await app.close();
  });

  beforeEach(async () => {
    const response = await post('/company/login', { username: 'sawada', password: 'company@123'});
      if (response) {
        const jresponse = JSON.parse(response.text);
        if (jresponse.data) { tokenc = jresponse.data.token; }
      }
  });

  afterEach(function() {
    tokenc = '';
  });

  it('gets /company endpoint', async done => {
    const response = await request.get('/company');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Company Page');
    done();
  });

  it('posts to /create endpoint, Field is required', async done => {
    const response = await post('/company/create', { email: 'hasankataya10@gmail.com', password: 'admin@123' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).Missing.Field).toBe('username is required');
    done();
  });

  it('posts to /create endpoint, Field is required', async done => {
    const response = await post('/company/create', { username: 'gmaiom', password: 'admin@123' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).Missing.Field).toBe('email is required');
    done();
  });

  it('posts to /create endpoint, Field is required', async done => {
    const response = await post('/company/create', { username: 'gmaiom', email: 'admin@123.com' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).Missing.Field).toBe('password is required');
    done();
  });

  it('posts to /create endpoint, Success', async done => {
    const response = await post('/company/create', {
      username: 'sawada', email: 'salah.awd@outlook.com', password: 'company@123', CompanyIndustry: 'software',
      CompanyWebsite: 'www.ss.com',
    });
    expect(JSON.parse(response.text).msg).toBe(VadlidationStatus.SuccessfulComapnyPersist);
    expect(response.status).toBe(200);

    done();
  });

  it('posts to /create endpoint, Success', async done => {
    const response = await post('/company/create', {
      username: 'sami12', email: 'sami.awd@outlook.com', password: 'company@123', CompanyIndustry: 'software',
      CompanyWebsite: 'www.ss.com',
    });
    expect(JSON.parse(response.text).msg).toBe(VadlidationStatus.SuccessfulComapnyPersist);
    expect(response.status).toBe(200);
    done();
  });

  it('posts to /login endpoint, Field is required', async done => {
    const response = await post('/company/login', { email: 'salahom', password: 'Sami12@34' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).Missing.Field).toBe('username is required');
    done();
  });

  it('posts to /login endpoint, Field is required', async done => {
    const response = await post('/company/login', { username: 'sawada', email: 'salahom' });
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).Missing.Field).toBe('password is required');
    done();
  });

  it('posts to /login endpoint, Login Failed', async done => {
    const response = await post('/company/login', { username: 'sawada', password: 'company@12' });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.text).failed).toBe('Login failed');
    done();
  });

  it('posts to /login endpoint, Login Successful', async done => {
    const response = await post('/company/login', { username: 'sawada', password: 'company@123' });
    expect(JSON.parse(response.text).msg).toBe('Successfuly Logged In');
    expect(response.status).toBe(200);
    tokenc = JSON.parse(response.text).data.token;
    done();
  });

  it('gets from /viewProfile endpoint, Successful', async done => {
    const response = await request.get('/company/viewProfile').set('authorization', 'Bearer ' + tokenc + '');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /viewProfile endpoint, Failed (Forbidden)', async done => {
    const response = await request.get('/company/viewProfile').set('authorization', 'Bearer ' + '12');
    expect(response.status).toBe(403);
    done();
  });

  it('posts to /updateProfile endpoint, email already exists', async done => {
    const response = await post('/company/updateProfile', { email: 'sami.awd@outlook.com' });
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.EmailFound);
    expect(response.status).toBe(422);
    done();
  });

  it('posts to /updateProfile endpoint, unchangable password', async done => {
    const response = await post('/company/updateProfile', { hash: 'sami.awd@outlook.com' });
    expect(JSON.parse(response.text).error).toBe('password related fields cannot be changed');
    expect(response.status).toBe(422);
    done();
  });

  it('posts to /updateProfile endpoint, unchangable username', async done => {
    const response = await post('/company/updateProfile', { username: 'sami.awd@outlook.com' });
    expect(JSON.parse(response.text).error).toBe('username cannot be changed');
    expect(response.status).toBe(422);
    done();
  });

  it('posts to /updateProfile endpoint, Success', async done => {
    const response = await post('/company/updateProfile', { company_description: 'sami.awd@outlook.com' });
    expect(JSON.parse(response.text).message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /fetch endpoint, Successful', async done => {
    const response = await request.get('/company/fetch?email=sami.awd%40outlook.com');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /fetch endpoint, company not found', async done => {
    const response = await request.get('/company/fetch?email=sami.awd%40outlok.com');
    expect(response.status).toBe(404);
    done();
  });

  it('gets from /fetchJob endpoint, missing field', async done => {
    const response = await request.get('/company/fetchJob?email=sami.awd%40outlook.com');
    expect(response.status).toBe(422);
    done();
  });

  // it('gets from /fetchJob endpoint, missing field', async done => {
  //   const response = await request.get('/company/fetchJob?id=sami.awd%40outlook.com');
  //   expect(response.status).toBe(422)
  //   done()
  // });

  it('gets from /deactivate endpoint, Forbidden', async done => {
    const response = await request.get('/company/deactivate').set('authorization', 'Bearer ' + '12');
    expect(response.status).toBe(403);
    done();
  });

  it('gets from /deactivate endpoint, deactivate non verified account', async done => {
    const response = await request.get('/company/deactivate').set('authorization', 'Bearer ' + tokenc);
    expect(response.status).toBe(404);
    done();
  });

  it('gets from /jobPosts endpoint, No job posts yet', async done => {
    const response = await request.get('/company/jobPosts').set('authorization', 'Bearer ' + tokenc);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('No jobs posted yet');
    done();
  });

  it('gets from /jobPosts endpoint, No job posts yet', async done => {
    const response = await request.get('/company/jobPosts').set('authorization', 'Bearer ' + 'c');
    expect(response.status).toBe(403);
    expect(response.text).toBe('Forbidden');
    done();
  });

  // TODO add third jobPost test when a job post is created

  it('posts to /jobPosts/createJob endpoint, Field required', async done => {
    const response = await post('/company/jobPosts/createJob', { JobTitle: 'CTO', Email: 's@s.s' });
    expect(JSON.parse(response.text).message).toBe('CompanyIndustry is required');
    expect(response.status).toBe(422);
    done();
  });

  it('posts to /jobPosts/createJob endpoint, Successful', async done => {
    const response = await post('/company/jobPosts/createJob', { JobTitle: 'CTO', Email: 'ssami@sss.com', CompanyIndustry: 'software', CompanyWebsite: 'www.ss.com' });
    expect(JSON.parse(response.text).message).toBe('Successfully created jobs');
    jobObj.id = JSON.parse(response.text).data._id;
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts/addQuestion endpoint, Successfully added questions', async done => {
    const response = await post('/company/jobPosts/addQuestion', { jobTitle: jobObj.JobTitle, questions: ['hello', 'hi'] });
    expect(JSON.parse(response.text).message).toBe('Successfully Added Questions');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts/updateQuestion endpoint, Successfully added questions', async done => {
    const response = await post('/company/jobPosts/updateQuestion', { jobTitle: jobObj.JobTitle, index: '0', question: 'hi' });
    expect(JSON.parse(response.text).message).toBe('Successfully Updated Question');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts endpoint, Success', async done => {
    const response = await request.get('/company/jobPosts').set('authorization', 'Bearer ' + tokenc);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).message).toBe('Successfully found jobs');
    done();
  });
  it('gets from /jobPosts endpoint, Success found job with company', async done => {
    const response = await request.get('/company/jobPosts/getJobWithCompany/' + jobObj.id).set('authorization', 'Bearer ' + tokenc);
    expect(JSON.parse(response.text).message).toBe('Successfully found job with company');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts endpoint, forbidden', async done => {
    const response = await request.get('/company/jobPosts/getJobWithCompany/' + jobObj.id).set('authorization', 'Bearer ' + '2');
    expect(response.text).toBe('Forbidden');
    expect(response.status).toBe(403);
    done();
  });

  it('gets from /jobPosts endpoint, Successfully fetched job post', async done => {
    const response = await request.get('/company/jobPosts/' + jobObj.id).set('authorization', 'Bearer ' + tokenc);
    expect(JSON.parse(response.text).message).toBe('Successfully fetched job post');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts endpoint, forbidden', async done => {
    const response = await request.get('/company/jobPosts/' + jobObj.id).set('authorization', 'Bearer ' + '2');
    expect(response.text).toBe('Forbidden');
    expect(response.status).toBe(403);
    done();
  });

  it('posts to /jobPosts/createJob endpoint, Forbidden', async done => {
    const temp_token = tokenc;
    tokenc = '2';
    const response = await post('/company/jobPosts/createJob', { JobTitle: 'CTO', Email: 's@s.s' });
    expect(response.status).toBe(403);
    tokenc = temp_token;
    done();
  });

  it('gets from /searchCompany endpoint, Missingfield', async done => {
    const response = await request.get('/company/searchCompany');
    expect(JSON.parse(response.text).Missing).toBe('search text is required');
    expect(response.status).toBe(422);
    done();
  });

  it('gets from /searchCompany endpoint, Success', async done => {
    const response = await request.get('/company/searchCompany?plain=sami');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /searchJob endpoint, Not Found', async done => {
    const response = await request.get('/company/searchJob?plain=samisasa');
    expect(response.status).toBe(404);
    done();
  });

  it('gets from /searchJob endpoint, Missingfield', async done => {
    const response = await request.get('/company/searchJob');
    expect(JSON.parse(response.text).Missing).toBe('search text is required');
    expect(response.status).toBe(422);
    done();
  });

  it('gets from /searchCompany endpoint, No result found', async done => {
    const response = await request.get('/company/searchJob?plain=samismimi');
    expect(response.status).toBe(404);
    done();
  });

  it('gets from /searchCompany endpoint, Success', async done => {
    const response = await request.get('/company/searchJob?JobTitle=CTO');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /searchCompany endpoint, No Result', async done => {
    const response = await request.get('/company/searchJob?plain=samisasa');
    expect(response.status).toBe(404);
    done();
  });

  it('gets from /jobPosts/:id/updateJob endpoint, Successfully updated jobs', async done => {
    const response = await post('/company/jobPosts/' + jobObj.id + '/updateJob', { CompanyIndustry: 'food' });
    expect(JSON.parse(response.text).message).toBe('Successfully updated jobs');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts/:id/updateJob endpoint, Failed At least one field is required', async done => {
    const response = await post('/company/jobPosts/' + jobObj.id + '/updateJob', {});
    expect(JSON.parse(response.text).message).toBe('At least one field is required');
    expect(response.status).toBe(422);
    done();
  });

  it('gets from /jobPosts/:id/updateJob endpoint, Forbidden', async done => {
    const temp_token = tokenc;
    tokenc = '2';
    const response = await post('/company/jobPosts/' + jobObj.id + '/updateJob', {});
    expect(response.text).toBe('Forbidden');
    expect(response.status).toBe(403);
    tokenc = temp_token;
    done();
  });

  it('gets from /jobPosts/:id/closJob endpoint, Successfully closed job', async done => {
    const response = await post('/company/jobPosts/' + jobObj.id + '/closeJob', { CompanyIndustry: 'food' });
    expect(JSON.parse(response.text).message).toBe('Successfully closed job');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts/:id/closJob endpoint, Forbidden', async done => {
    const temp_token = tokenc;
    tokenc = '2';
    const response = await post('/company/jobPosts/' + jobObj.id + '/closeJob', { CompanyIndustry: 'food' });
    expect(response.text).toBe('Forbidden');
    expect(response.status).toBe(403);
    tokenc = temp_token;
    done();
  });

  it('gets from /jobPosts/:id/deactivateJob endpoint, Successfully deactivateJob job', async done => {
    const response = await post('/company/jobPosts/' + jobObj.id + '/deactivateJob', { CompanyIndustry: 'food' });
    expect(JSON.parse(response.text).message).toBe('Successfully deactivated job');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /jobPosts/:id/deactivateJob endpoint, Forbidden', async done => {
    const temp_token = tokenc;
    tokenc = '2';
    const response = await post('/company/jobPosts/' + jobObj.id + '/deactivateJob', { CompanyIndustry: 'food' });
    expect(response.text).toBe('Forbidden');
    expect(response.status).toBe(403);
    tokenc = temp_token;
    done();
  });

  it('gets from /projects/createProject endpoint, Successfully created project', async done => {
    const response = await post('/company/projects/createProject', projectObj);
    projectObj.id = JSON.parse(response.text).data._id;
    expect(JSON.parse(response.text).message).toBe('Successfully Created Project');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/addQuestion endpoint, Successfully added questions', async done => {
    const response = await post('/company/projects/addQuestion', { projectTitle: projectObj.ProjectTitle, questions: ['hello', 'hi'] });
    expect(JSON.parse(response.text).message).toBe('Successfully Added Questions');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/updateQuestion endpoint, Successfully added questions', async done => {
    const response = await post('/company/projects/updateQuestion', { projectTitle: projectObj.ProjectTitle, index: '0', question: 'hi' });
    expect(JSON.parse(response.text).message).toBe('Successfully Updated Question');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects endpoint, Successfully fetched all projects', async done => {
    const response = await request.get('/company/projects').set('authorization', 'Bearer ' + tokenc);
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/:id endpoint, Successfully fetched project', async done => {
    const response = await request.get('/company/projects/' + projectObj.id).set('authorization', 'Bearer ' + tokenc);
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/:id/updateProject endpoint, Successfully updated project', async done => {
    const response = await post('/company/projects/' + projectObj.id + '/updateProject', { ProjectLength: 10 });
    expect(JSON.parse(response.text).message).toBe('Successfully updated project');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/:id/closeProject endpoint, Successfully closed project', async done => {
    const response = await post('/company/projects/' + projectObj.id + '/closeProject', {});
    expect(JSON.parse(response.text).message).toBe('Successfully closed project');
    expect(response.status).toBe(200);
    done();
  });

  it('gets from /projects/:id/deactivateProject endpoint, Successfully deactivated project', async done => {
    const response = await post('/company/projects/' + projectObj.id + '/deactivateProject', {});
    expect(JSON.parse(response.text).message).toBe('Successfully deactivated project');
    expect(response.status).toBe(200);
    done();
  });
});
