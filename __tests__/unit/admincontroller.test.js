// Loading Models into mongoose
require('../../src/models/Admin.js');
require('../../src/models/Skill.js');
require('../../src/models/Status.js');
const MongooseHelper = require('../../src/models/MongooseHelper');
const util = require('../../src/controllers/utilities');
const AdminModel= MongooseHelper.getModel('AdminModel');
import 'regenerator-runtime/runtime';
import Chance from 'chance';
const chance = new Chance();
const STRINGPASS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERPASS='0123456789';

/* eslint-disable require-jsdoc */
const {
  AdminController,
  VadlidationStatus,
} = require('../../src/controllers/admincontroller');
const AdminPersister = require('../persistence/adminpersister');
const {APIStatus} = require('../../src/models/classes/DevResponse');

const controller = new AdminController(new AdminPersister());

test('Create Admin invalid password', (done) => {
  const admin =
    `{"email": "${chance.email()}", "password": "123", "username": "${chance.string({
      length: 9,
      pool: STRINGPASS,
    })}"}`;
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WongPassword);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin invalid password no special character', (done) => {
  const admin =
  `{"email":"${chance.email()}", "password": "123", "username": "hasank"}`;
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WongPassword);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin invalid username less than 6 characters', (done) => {
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawad"}';
  const promise = controller.createNewAdmin(JSON.parse(admin));

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin invalid username more than 9 characters', (done) => {
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawadawada"}';

  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin invalid email address', (done) => {
  const admin =
    '{"email": "salah.awadoutlook.com", "password": "admin@123", "username": "sawada"}';

  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin Invalid Phone number', (done) => {
  // eslint-disable-next-line
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123","username": "sawada", "phonenumber" : "211229sd"}';
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPhone);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin Invalid First Name', (done) => {
  // eslint-disable-next-line
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada", "firstname":"salah @wad"}';
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongFirstname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin Invalid Last Name', (done) => {
  // eslint-disable-next-line
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada", "lastname":"salah @wad"}';
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongLastname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Admin Email or Username Already Taken', (done) => {
  const admin =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada"}';
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UsernameFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('An Error Occured While Finding User', (done) => {
  const admin =
    '{"email": "hasan.kataya@outlook.com", "password": "admin@123", "username": "hasank"}';
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('An Error Occured While Persisting User', (done) => {
  const admin =
    '{"email": "hasan.kataya@outlook.com", "password": "admin@123", "username": "hasank"}';
  const myMock = jest
      .spyOn(controller.Persister, 'persistAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Persisting User'))
      );
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.PersistError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('User Created Succesfully.', (done) => {
  const admin =
    '{"email": "hasan.kataya@outlook.com", "password": "admin@123", "username": "hasank"}';
  const emailMock = jest
      .spyOn(util, 'sendEmail')
      .mockImplementation(() => 1);
  const promise = controller.createNewAdmin(JSON.parse(admin));
  promise.then((response) => {
    expect(response.data.username).toBe(JSON.parse(admin).username);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    emailMock.mockRestore();
    done();
  });
});

test('Update Admin invalid password', (done) => {
  const updatedFields = '{"email": "salah.awad@outlook.com", "password": "admin"}';
  const username = 'sawada';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WongPassword);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin invalid email address', (done) => {
  const updatedFields = '{"email": "salah.awadoutlook.com", "password": "admin@123"}';
  const username = 'sawada';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin Invalid Phone number', (done) => {
  const updatedFields =
    '{"phonenumber" : "211229sd"}';
  const username = 'sawada';

  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPhone);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin Invalid First Name', (done) => {
  const updatedFields =
    '{ "firstname":"salah @wad"}';
  const username = 'sawada';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongFirstname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin Invalid Last Name', (done) => {
  const updatedFields =
    '{ "lastname":"salah @wad"}';
  const username = 'sawada';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongLastname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin User Not Found', (done) => {
  const updatedFields = '{ "fullname":"salah awad"}';
  const username = 'salahW';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('An Error Occured While Updating User', (done) => {
  const updatedFields = '{"password": "admin@123", "fistname":"salah", "lastname":"awad"}';
  const username = 'sawada';
  const myMock = jest
      .spyOn(controller.Persister, 'updateAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Updating User'))
      );
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Update Admin User Updated Successfully', (done) => {
  const updatedFields = '{"password": "admin@123", "firstname":"salah awad"}';
  const username = 'sawada';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.data.firstname).toBe(JSON.parse(updatedFields).firstname);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Update Admin Email Field, Email Already in database', (done) => {
  const updatedFields =
    '{"email": "salah.awad@outlook.com","password": "admin@123", "fullname":"hasan kataya"}';
  const username = 'hasank';
  const promise = controller.updateAdmin(username, JSON.parse(updatedFields));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.EmailFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Admin Email Field, Find Error', (done) => {
  const admin =
    '{"email": "hasan.kataya@outlook.com","password": "admin@123", "fullname":"hasan kataya"}';
  const username = 'hasank';
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.updateAdmin(username, JSON.parse(admin));
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Update Admin Email Field, Email Updated', (done) => {
  const admin = '{"email": "hasan.kataya@outlook.com","password": "admin@123"}';
  const username = 'sawada';
  const emailMock = jest.spyOn(util, 'sendEmail').mockImplementation(() => 1);
  const promise = controller.updateAdmin(username, JSON.parse(admin));
  promise.then((response) => {
    expect(response.data.email).toBe(JSON.parse(admin).email);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    emailMock.mockRestore();
    done();
  });
});

test('Deactivate Admin User Not Found', (done) => {
  const username = 'hasank';
  const promise = controller.deactivateAdmin(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate Admin User Deactivated Successfuly', (done) => {
  const username = 'sawada';
  const promise = controller.deactivateAdmin(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Deactivate Admin, An Error Occured While Updating User', (done) => {
  const username = 'sawada';
  const myMock = jest
      .spyOn(controller.Persister, 'updateAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Updating User'))
      );
  const promise = controller.deactivateAdmin(username);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Deactivate Admin An Error Occurred while finding user', (done) => {
  const username = 'sawada';
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.deactivateAdmin(username);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Get Admin Profile Successful', (done) => {
  const username = 'sawada';
  const promise = controller.getAdmin(username);
  promise.then((response) => {
    expect(response.data.username).toBe(username);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Get Admin Profile User not Found', (done) => {
  const username = 'hasank';
  const promise = controller.getAdmin(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Get Admin An Error Occurred while finding user', (done) => {
  const username = 'sawada';
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );

  const promise = controller.getAdmin(username);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Login Admin Invalid username or password', (done) => {
  const admin = {username: 'sawada', password: 'admin@10'};
  const promise = controller.validateAdminLogin(admin);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidCredentials);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Login Admin Successful', (done) => {
  const admin = {username: 'sawada', password: 'admin@123'};
  const promise = controller.validateAdminLogin(admin);
  promise.then((response) => {
    expect(response.data.username).toBe(admin.username);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Login Admin Error finding User', (done) => {
  const admin = {username: 'sawada', password: 'admin@123'};
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.validateAdminLogin(admin);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});


test('Login Admin User not active', (done) => {
  const admin = {username: 'sawada', password: 'admin@123'};
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation((username, email) =>{
        const dummy = new AdminModel({
          'email': 'salah.awad@outlook.com',
          'password': 'admin@123',
          'username': 'sawada',
          'Active': false,
          'isdeactivated': false,
        });
        dummy.setPassword(dummy.password);
        if (dummy.email === email || dummy.username === username) {
          return Promise.resolve(dummy);
        }
        return null;
      });
  const promise = controller.validateAdminLogin(admin);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.NotActive);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Login Admin account is deactivated', (done) => {
  const admin = {username: 'sawada', password: 'admin@123'};
  const myMock = jest
      .spyOn(controller.Persister, 'findAdmin')
      .mockImplementation((username, email) =>{
        const dummy = new AdminModel({
          'email': 'salah.awad@outlook.com',
          'password': 'admin@123',
          'username': 'sawada',
          'isdeactivated': true,
        });
        dummy.setPassword(dummy.password);
        if (dummy.email === email || dummy.username === username) {
          return Promise.resolve(dummy);
        }
        return null;
      });
  const promise = controller.validateAdminLogin(admin);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.Deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Test that admin unlocks existent locked developer and an email is sent to developer.', (done) => {
  const mock = jest.spyOn(util, 'sendEmail')
      .mockImplementation(() => {});
  const email = 'test@test.test';
  const adminpersister = {
    findAdmin: jest.fn(async () => {
      return {email, isLocked: true};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  admincontroller.unlockDeveloper('developer').then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    mock.mockRestore();
    done();
  });
});

test('Test that admin fails to unlock existent unlocked developer.', (done) => {
  const email = 'not@used.mail';
  const adminpersister = {
    findAdmin: jest.fn(async () => {
      return {email, isLocked: false};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.unlockDeveloper('developer');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.DeveloperNotLocked);
    done();
  });
});

test('Test that can\'t unlock non-existent developer.', (done) => {
  const adminpersister = {
    findAdmin: jest.fn(async () => {
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.unlockDeveloper('developer');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.DeveloperNotExistent);
    done();
  });
});

test('Test that can\'t unlock developer given that persistor fails.', (done) => {
  const adminpersister = {
    findAdmin: jest.fn(async () => {
      throw new Error('Find error');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.unlockDeveloper('developer');
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Successfully created Skill', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return null;
    }),
    persistSkill: jest.fn(async ()=>{
      return {filterData: ()=>{
        return 1;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed creating Skill, User Already Exists', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {SkillName: 'javaa', SkillDescription: '123456'};
    }),
    persistSkill: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.SkillFound);
    done();
  });
});

test('Error creating Skill, Finding Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      throw new Error('Error finding user');
    }),
    persistSkill: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    done();
  });
});

test('Error creating Skill, Persist Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return null;
    }),
    persistSkill: jest.fn(async ()=>{
      throw new Error('Error persisting user');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.PersistSkillError);
    done();
  });
});

test('Successfully Viewed Skill', (done) => {
  const adminpersister = {
    findSkillAll: jest.fn(async (x) => {
      return [{filterData: ()=>{
        return 1;
      }}];
      // return [{}, {}];
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.viewSkill();

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Error Viewing Skill, Find Error', (done) => {
  const adminpersister = {
    findSkillAll: jest.fn(async (x) => {
      throw new Error('Error finding user');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.viewSkill();

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    done();
  });
});

test('Failed creating Skill, Invalid Description', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {SkillName: 'javaa', SkillDescription: '123456'};
    }),
    persistSkill: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: 'abcdee', SkillDescription: chance.string({length: 251, pool: STRINGPASS, symbol: true})});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongDescription);
    done();
  });
});

test('Failed creating Skill, Invalid Skill name', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {SkillName: 'javaa', SkillDescription: '123456'};
    }),
    persistSkill: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createSkill({SkillName: '', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongSkillname);
    done();
  });
});

test('Successfully Accepted Verification Request', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({x: 1});
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({username: 'sawada', isdeactivated: true});
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);

    done();
  });
});

test('Failed Accepted Verification Request, Request not Found', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({username: 'sawada', isdeactivated: true});
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.RequestsNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Accepted Verification Request, User not found', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({x: 1});
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Accepting Verification Request, Finding Error', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      throw new Error(VadlidationStatus.NotFound);
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Accepting Verification Request, Updating Error', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({});
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      throw new Error(VadlidationStatus.UpdateError);
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({isdeactivated: true});
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Accepting Verification Request, Delete Error', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({});
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      throw new Error(VadlidationStatus.deleteError);
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({isdeactivated: true});
      });
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.deleteError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Accepting Verification Request, Find Error', (done) => {
  const adminpersister = {
    findRequest: jest.fn(async (x)=>{
      return new Promise((resolve)=>{
        resolve({});
      });
    }),
    updateCompany: jest.fn(async (x, y) => {
      return new Promise((resolve)=>{
        resolve(1);
      });
    }),
    deleteRequestOr: jest.fn(async (x)=>{
      return null;
    }),
    findCompanyOr: jest.fn(async (x)=>{
      throw new Error(VadlidationStatus.FindError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.acceptRequest('sawada');

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Successfully updated Skill', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {SkillName: 'abcdee'};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return 1;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed updating Skill, Skill not Found', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return null;
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});

test('Error updating Skill, Update Error', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateSkillError);
    done();
  });
});

test('Error updating Skill, Find Error', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    done();
  });
});

test('Successfully Deactivated Skill', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {filterData: ()=>{
        return 1;
      }};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return null;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed Deactivating Skill, Invalid Skill Name', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: '', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongSkillname);
    done();
  });
});

test('Failed Deactivating Skill, Skill already deactivated', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {isdeactivated: true};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.SkillDeactivated);
    done();
  });
});

test('Failed Deactivating Skill, Skill not found ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return null;
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});


test('Error Deactivating Skill, Find Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    done();
  });
});

test('Error Deactivating Skill, Update Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateSkillError);
    done();
  });
});

test('Successfully Reactivated Skill', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {filterData: ()=>{
        return 1;
      },
      isdeactivated: true,
      };
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return null;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Reactivating Skill, Invalid Skill Name', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: '', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongSkillname);
    done();
  });
});
test('Failed Reactivating Skill, Skill already activated', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {isdeactivated: false};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.AlreadyActive);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Reactivating Skill, Skill not found ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return null;
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});


test('Error Reactivating Skill, Find Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateSkill: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    done();
  });
});

test('Error Reactivating Skill, Update Error ', (done) => {
  const adminpersister = {
    findSkillOr: jest.fn(async (x) => {
      return {x: 1, isdeactivated: true};
    }),
    updateSkill: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateSkill({SkillName: 'abcdee', SkillDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateSkillError);
    done();
  });
});

test('Successfully created Status', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    persistStatus: jest.fn(async ()=>{
      return {filterData: ()=>{
        return 1;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed creating Status, Status Already Exists', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {StatusName: 'javaa', StatusDescription: '123456'};
    }),
    persistStatus: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.StatusFound);
    done();
  });
});

test('Error creating Status, Finding Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error('Error finding user');
    }),
    persistStatus: jest.fn(async ()=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Error creating Status, Persist Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    persistStatus: jest.fn(async ()=>{
      throw new Error('Error persisting user');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.createStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.PersistError);
    done();
  });
});

test('Successfully updated Status', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {filterData: ()=>{
        return 1;
      },
      StatusName: 'abcdee',
      };
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return 1;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed updating Status, Status not Found', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return 1;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});

test('Error updating Status, Update Error', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    done();
  });
});

test('Error updating Status, Find Error', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.updateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});


test('Successfully Deactivated Status', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {filterData: ()=>{
        return 1;
      }};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return 1;
      }};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('Failed Deactivating Status, Invalid Status Name (length = 0)', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: '', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongStatusname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Deactivating Status, Invalid Status Name (>250)', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: chance.string({length: 251, pool: STRINGPASS, symbol: true}), StatusDescription: '12345'});
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongStatusname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Deactivating Status, Invalid Status Description', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'sawada', StatusDescription: chance.string({length: 251, pool: STRINGPASS, symbol: true})});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongDescription);
    done();
  });
});

test('Failed Deactivating Status, Status already deactivated', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {isdeactivated: true};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.deactivated);
    done();
  });
});

test('Failed Deactivating Status, Status not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});


test('Error Deactivating Status, Find Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Error Deactivating Status, Update Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    done();
  });
});

test('Successfully Reactivated Status', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {filterData: ()=>{
        return 1;
      },
      isdeactivated: true,
      };
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return {filterData: ()=>{
        return 1;
      }
      };
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Reactivating Status, Invalid Status Name', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: '', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongStatusname);
    done();
  });
});

test('Failed Reactivating Status, Status already activated', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {isdeactivated: false};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.AlreadyActive);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Reactivating Status, Status not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.NotFound);
    done();
  });
});


test('Error Reactivating Status, Find Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    updateStatus: jest.fn(async (x, y)=>{
      return null;
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Error Reactivating Status, Update Error ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {x: 1, isdeactivated: true};
    }),
    updateStatus: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.reactivateStatus({StatusName: 'abcdee', StatusDescription: '12345'});

  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    done();
  });
});

test('Successfully Assigned Status to Company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Assigning Status to Company, status not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigneing Status to Company, invalid status ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: ''});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongStatusname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigneing Status to Company, invalid company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'lkjhgfdcslkjhgfds'}, {StatusName: 'abdcde'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigning Status to Company, company not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return null;
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigning Status to Company, company deactivated ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {_id: 1, isdeactivated: true};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigning Status to Company, status deactivated ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: true};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {_id: 1, isdeactivated: false};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Assigneing Status to Company, status already exist in company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 12, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sawada'}, {StatusName: 'abdcde'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.StatusFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Assigned Status to Company, find company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      throw new Error(VadlidationStatus.FindError);
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Assigned Status to Company, status find ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Assigned Status to Company, assign ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    assignStatus: jest.fn(async (x, y) => {
      throw new Error('Error assigning');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.assign({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.AssignError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Successfully deprived Status to Company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 12, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed depriveing Status to Company, status not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return null;
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriving Status to Company, invalid status ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: ''});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongStatusname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriveeing Status to Company, invalid company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'lkjhgfdcslkjhgfds'}, {StatusName: 'abdcde'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriveing Status to Company, company not found ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return null;
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriveing Status to Company, company deactivated ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {_id: 1, isdeactivated: true};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriveing Status to Company, status deactivated ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: true};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {_id: 1, isdeactivated: false};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed depriveeing Status to Company, status not found in company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sawada'}, {StatusName: 'abdcde'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.StatusNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error depriveed Status to Company, find company ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 1, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      throw new Error(VadlidationStatus.FindError);
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error depriveed Status to Company, status find ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      throw new Error(VadlidationStatus.FindError);
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      return {x: 1};
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error depriveed Status to Company, deprive ', (done) => {
  const adminpersister = {
    findStatusOr: jest.fn(async (x) => {
      return {_id: 12, isdeactivated: false};
    }),
    findCompanyOr: jest.fn(async (x)=>{
      return {x: 1, isdeactivated: false, company_status: [12, 13, 14]};
    }),
    depriveStatus: jest.fn(async (x, y) => {
      throw new Error('Error depriveing');
    }),
  };
  const admincontroller = new AdminController(adminpersister);
  const promise = admincontroller.deprive({username: 'sami12'}, {StatusName: 'abcdes'});

  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.DepriveError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Test that creating status succeeds when persistor succeeds and status is unique.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation((name) => Promise.resolve(null));
  const promise = controller.createDeveloperStatus('I am a developer status', 'status description here');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeveloperStatusCreationSuccess);
    mock.mockRestore();
    done();
  });
});


test('Test that creating status fails when status is not unique.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation((name) => Promise.resolve({}));
  const promise = controller.createDeveloperStatus('I am a developer status', 'status description here');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeveloperStatusAlreadyExists);
    mock.mockRestore();
    done();
  });
});

test('Test that creating status fails when persistor fails to add status.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'addDeveloperStatus')
      .mockImplementation((name, description) => Promise.reject(new Error('[Mocked Persistor] Cannot add developer status.')));
  const promise = controller.createDeveloperStatus('I am a developer status', 'status description here');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotPersistDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Test that creating status fails when persistor cannot search for status.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation((name) => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer status.')));
  const promise = controller.createDeveloperStatus('I am a developer status', 'status description here');
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotSearchForDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Test that creating status fails when name is greater than 250 characters.', (done) => {
  const promise = controller.createDeveloperStatus(
      chance.string({length: 251, pool: STRINGPASS, symbol: true}),
      'status description here'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.InvalidName);
    done();
  });
});

test('Test that creating status fails when description is greater than 250 characters.', (done) => {
  const promise = controller.createDeveloperStatus(
      'status description here',
      chance.string({length: 251, pool: STRINGPASS, symbol: true})
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.InvalidDescription);
    done();
  });
});

test('Test that updating developer status succeeds when persistor is working, developer status is found, and description valid.', (done) => {
  const promise = controller.updateDeveloperStatus(
      'found dev status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.UpdateDeveloperStatusSuccess);
    done();
  });
});

test('Test that updating developer status fails when persistor is working but name is invalid.', (done) => {
  const promise = controller.updateDeveloperStatus(
      chance.string({length: 251, pool: STRINGPASS, symbol: true}),
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.InvalidName);
    done();
  });
});

test('Test that updating developer status fails when persistor is working and name found but description is invalid.', (done) => {
  const promise = controller.updateDeveloperStatus(
      'I am name.',
      chance.string({length: 251, pool: STRINGPASS, symbol: true})
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.InvalidDescription);
    done();
  });
});

test('Test that updating developer status fails when persistor is working but name not found.', (done) => {
  const promise = controller.updateDeveloperStatus(
      'I am name.',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeveloperStatusNotFound);
    done();
  });
});

test('Test that updating developer status fails when persistor cannot search for developer status.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer status.')));
  const promise = controller.updateDeveloperStatus(
      'I am name.',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotSearchForDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Test that updating developer status fails when persistor cannot update developer status.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'updateDeveloperStatus')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot update developer status.')));
  const promise = controller.updateDeveloperStatus(
      'found dev status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotUpdateDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Test that deactivate succeeds when developer status exists and persistor is working.', (done) => {
  const promise = controller.deactivateDeveloperStatus(
      'found dev status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Successful);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeactivateDeveloperStatusSucceeds);
    done();
  });
});

test('Test that deactivate fails when developer status does not exist and persistor is working.', (done) => {
  const promise = controller.deactivateDeveloperStatus(
      'not found status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeveloperStatusNotFound);
    done();
  });
});

test('Test that deactivate fails when persistor cannot search.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot search for developer status.')));
  const promise = controller.deactivateDeveloperStatus(
      'not found status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotSearchForDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Test that deactivate fails when developer status already deactivated.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'findDeveloperStatus')
      .mockImplementation(() => Promise.resolve({isDeactivated: true}));
  const promise = controller.deactivateDeveloperStatus(
      'I am name',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.DeveloperStatusAlreadyDeactivated);
    mock.mockRestore();
    done();
  });
});

test('Test that deactivate fails when developer found but persistor cannot update developer status.', (done) => {
  const mock = jest
      .spyOn(controller.Persister, 'updateDeveloperStatus')
      .mockImplementation(() => Promise.reject(new Error('[Mocked Persistor] Cannot update developer status.')));
  const promise = controller.deactivateDeveloperStatus(
      'found dev status',
      'I am description.'
  );
  promise.then((devResponse) => {
    expect(devResponse.getStatus()).toBe(APIStatus.Failed);
    expect(devResponse.getMessage()).toBe(VadlidationStatus.CannotUpdateDeveloperStatus);
    mock.mockRestore();
    done();
  });
});

test('Deactivate User, User Not Found', (done) => {
  const username = 'hasank';
  const type = 'admin';
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate User, Invalid User', (done) => {
  const username = 'sawada';
  const type = 'notCompany';
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidUser);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate User, Deactivate Successful', (done) => {
  const username = 'sawada';
  const type = 'admin';
  const mongooseMock = jest
      .spyOn(MongooseHelper, 'getModel')
      .mockImplementation(() =>'admin');
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(mongooseMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    mongooseMock.mockRestore();
    done();
  });
});

test('Deactivate User, Already Deactivated', (done) => {
  const username = 'libroC';
  const type = 'company';
  const mongooseMock = jest
      .spyOn(MongooseHelper, 'getModel')
      .mockImplementation(() =>'company');
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(mongooseMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.Deactivated);
    expect(response.status).toBe(APIStatus.Failed);
    mongooseMock.mockRestore();
    done();
  });
});


test('Deactivate User An Error Occurred while finding user', (done) => {
  const username = 'libroC';
  const type = 'company';
  const myMock = jest
      .spyOn(controller.Persister, 'findUser')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const mongooseMock = jest
      .spyOn(MongooseHelper, 'getModel')
      .mockImplementation(() =>'company');
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    mongooseMock.mockRestore();
    done();
  });
});

test('Deactivate User, An Error Occured While Updating User', (done) => {
  const username = 'sawada';
  const type = 'admin';
  const myMock = jest
      .spyOn(controller.Persister, 'updateUser')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Updating User'))
      );
  const mongooseMock = jest
      .spyOn(MongooseHelper, 'getModel')
      .mockImplementation(() =>'admin');
  const promise = controller.deactivateUserProfile(username, type);
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    mongooseMock.mockRestore();
    done();
  });
});
