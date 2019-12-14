const app = require('../../src/app');
const env = require('../../src/env');
const mongoose = require('mongoose');
const supertest = require('supertest');
const APIStatus = require('../../src/models/classes/DevResponse').APIStatus;
const { DeveloperController,
  RegisterDeveloperStatus,
  AccountAuthenticationStatus,
  ResetPasswordStatus,
  DeactivateDeveloperStatus,
  ReactivateDeveloperStatus,
  AddCapacityOfProjectsStatus,
  EditDeveloperSkillsStatus,
  VerifyDeveloperStatus,
  ViewProfileStatus,
  EditDeveloperStatus } = require('../../src/controllers/developercontroller');
const MongooseHelper = require('../../src/models/MongooseHelper');
const Skill = MongooseHelper.getModel('SkillModel');
const Developer = MongooseHelper.getModel('DeveloperModel');
const request = supertest(app);
describe('Developers e2e tests', () => {
  beforeAll(async () => {
    delete require.cache[require.resolve('../../src/app')];
    await mongoose.connect(env.env.app.testdburl, {
      useNewUrlParser: true,
    });
  });

  async function insertSkills(arrayOfSkillNames) {
    for (const skillName of arrayOfSkillNames) {
      await new Skill({ SkillName: skillName, SkillDescription: 'Any description' }).save();
    }
  }

  async function insertDeveloper() {
    await new Developer(registerDeveloperBody).save();
  }

  async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany();
    }
  }
  afterAll(async () => {
    await removeAllCollections();
    await mongoose.connection.close();
  });

  it('gets the test endpoint', async done => {
    const response = await request.get('/developer');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Developer Page');
    done();
  });

  const registerDeveloperBody = {
    username: 'hadich',
    password: 'Eypassword_#1',
    email: '1ndmonga@roshaveno.com',
    phone: '+96171416847',
    firstname: 'Hadi',
    lastname: 'Chahine',
    address: 'Beirut, Lebanon',
    gender: 'Male',
    languages: [
      {
        name: 'English',
        level: 'Good',
      },
    ],
    seniorityLevel: 'mid-senior level',
    yearsOfExperience: '2-5',
    lookingFor: 'Projects',
    educationLevel: 'Bachelors Degree',
    education: {
      major: 'Computer Science',
      graduationDate: '1766895771',
      undergrad: true,
    },
    skills: ['Clean Code', 'Architecture', 'Android Development'],
  };

  it('Register developer successfully', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    const response = await post('/developer/registerDeveloper', registerDeveloperBody);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(RegisterDeveloperStatus.SUCCESS);
  });

  it('Register developer failed no skills', async () => {
    const response = await post('/developer/registerDeveloper', registerDeveloperBody);
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Failed);
  });

  it('Login passed account unlocked', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const response = await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    });
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(AccountAuthenticationStatus.ACCOUNT_UNLOCKED);
  });

  it('Login passed account semilocked', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    const response = await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await removeAllCollections();
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Failed);
    expect(JSON.parse(response.text).message).toBe(AccountAuthenticationStatus.ACCOUNT_SEMILOCKED);
  });

  it('Login passed account locked', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    const response = await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_1',
    });
    await removeAllCollections();
    expect(response.status).toBe(422);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Failed);
    expect(JSON.parse(response.text).message).toBe(AccountAuthenticationStatus.ACCOUNT_LOCKED);
  });

  it('Login passed account not found', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const response = await post('/developer/loginByUsername', {
      username: 'hadich232',
      password: 'Eypassword_1#',
    });
    await removeAllCollections();
    expect(response.status).toBe(404);
  });

  it('Deactivate account', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const loginToken = JSON.parse((await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    })).text).token;
    const response = await authorizedPost('/developer/deactivateAccount', {}, loginToken);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(DeactivateDeveloperStatus.SUCCESS);
  });

  it('Deactivate account wrong authorization', async () => {
    const response = await authorizedPost('/developer/deactivateAccount', {}, '');
    expect(response.status).toBe(403);
  });

  it('Add developer capacity', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const loginToken = JSON.parse((await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    })).text).token;
    const response = await authorizedPost('/developer/addDeveloperCapacity', {
      capacity: 20,
    }, loginToken);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(AddCapacityOfProjectsStatus.SUCCESS);
  });

  it('Edit developer skills', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development', 'Extra Skill']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const loginToken = JSON.parse((await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    })).text).token;
    const response = await authorizedPost('/developer/editSkills', {
      skills: ['Clean Code', 'Architecture', 'Android Development', 'Extra Skill'],
    }, loginToken);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(EditDeveloperSkillsStatus.SUCCESS);
  });

  it('Edit developer skills unauthorized', async () => {
    const response = await authorizedPost('/developer/editSkills', {
      skills: ['Clean Code', 'Architecture', 'Android Development', 'Extra Skill'],
    }, '');
    expect(response.status).toBe(403);
  });

  it('Get profile', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development', 'Extra Skill']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const loginToken = JSON.parse((await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    })).text).token;
    const response = await authorizedPost('/developer/viewProfile', {}, loginToken);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(ViewProfileStatus.SUCCESS);
  });

  it('Edit developer', async () => {
    await insertSkills(['Clean Code', 'Architecture', 'Android Development', 'Extra Skill']);
    await post('/developer/registerDeveloper', registerDeveloperBody);
    const loginToken = JSON.parse((await post('/developer/loginByUsername', {
      username: 'hadich',
      password: 'Eypassword_#1',
    })).text).token;
    const response = await authorizedPost('/developer/edit', {
      firstname: 'Test'
    }, loginToken);
    await removeAllCollections();
    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).status).toBe(APIStatus.Successful);
    expect(JSON.parse(response.text).message).toBe(EditDeveloperStatus.DEVELOPER_UPDATED_SUCCESSFULLY);
  });

  function post(url, body) {
    const httpRequest = request.post(url);
    httpRequest.send(body);
    httpRequest.set('Accept', 'application/json');
    httpRequest.set('Content-Type', 'application/json');
    httpRequest.set('Origin', 'http://localhost:3001');
    return httpRequest;
  }

  function authorizedPost(url, body, token) {
    const httpRequest = request.post(url);
    httpRequest.send(body);
    httpRequest.set('Accept', 'application/json');
    httpRequest.set('Content-Type', 'application/json');
    httpRequest.set('Authorization', 'bearer ' + token);
    httpRequest.set('Origin', 'http://localhost:3001');
    return httpRequest;
  }
});

function authorizedGet(url, token) {
  const httpRequest = request.get(url);
  httpRequest.set('Content-Type', 'application/json');
  httpRequest.set('Authorization', 'bearer ' + token);
  return httpRequest;
}