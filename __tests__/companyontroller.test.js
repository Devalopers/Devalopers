/* eslint-disable require-jsdoc */
// Loading Models into mongoose
require('../src/models/Company.js');
require('../src/models/ReactivationRequest.js');
import 'regenerator-runtime/runtime';
import Chance from 'chance';
const chance = new Chance();
const STRINGPASS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const {
  CompanyController,
  VadlidationStatus,
} = require('../src/controllers/companycontroller');
const CompanyPersister = require('./persistence/companypersister');

const {APIStatus} = require('../src/models/classes/DevResponse');
const AlwaysFailingCompanyPersister = require('./persistence/alwaysFailingCompanyPersistor');
const Util = require('../src/controllers/utilities');

const Persister = new CompanyPersister();
const controller = new CompanyController(Persister);
const failingController = new CompanyController(
    new AlwaysFailingCompanyPersister()
);

test('Reactivation failed, User already activated', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve({
        email: 'sami.awad@outlook.com',
        username: 'sawada',
        is_verified: true,
        isdeactivated: false,
      });
    });
  });
  controller.reactivate(JSON.parse(user)).then((response) => {
    expect(response.message).toBe(VadlidationStatus.Active);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Reactivation failed, User is not verified', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve({
        email: 'sami.awad@outlook.com',
        username: 'sawada',
        is_verified: false,
        isdeactivated: true,
      });
    });
  });

  const promise = controller.reactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Verify);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});
test('User Created Succesfully', (done) => {
  const company =
    '{"email": "sami.sh@uni.com", "password": "Comp@123", "username": "samish"}';
  // eslint-disable-next-line no-unused-vars
  const sendMock = jest.spyOn(Util, 'sendEmail');
  sendMock.mockImplementation((z, x, c, v, b) => {
    return true;
  });
  const persistMock = jest.spyOn(Persister, 'persistCompany');
  persistMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve({});
    });
  });
  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulComapnyPersist);
    expect(response.status).toBe(APIStatus.Successful);
    persistMock.mockRestore();
    done();
  });
});

test('User Create failed \' username already exists \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "company@123", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UsernameFound);
    done();
  });
});


test('User Create failed \' username length >9 \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlooook.com", "password": "company@123", "username": "sawadaaaaaaaaaaaa"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);

    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('User Create failed \' username length <6 \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlooook.com", "password": "company@123", "username": "sasa"}';
  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    done();
  });
});

test('User Create failed \' username contains forbidden characters \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlooook.com", "password": "company@123", "username": "sami!*&"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongUsername);
    done();
  });
});

test('User Create failed \' email already exists \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "Comp@123", "username": "klnnnnn"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.UsernameFound);
    done();
  });
});

test('User Create failed \' invalid password missing number \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "Comp@", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    done();
  });
});

test('User Create failed \' invalid password missing character \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "@123456", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    done();
  });
});

test('User Create failed \' invalid password missing special character \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "Comp123", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    done();
  });
});

test('User Create failed \' invalid password length less than 6 \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "c3", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    done();
  });
});

test('User Create failed \' invalid email missing @ \' ', (done) => {
  const company =
    '{"email": "salah.awadoutlook.com", "password": "Comp@123", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    done();
  });
});

test('User Create failed \' invalid email missing . after @ \' ', (done) => {
  const company =
    '{"email": "salah.awad@outlookcom", "password": "comp@123", "username": "sawada"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    done();
  });
});

test('Create Company Invalid Phone number', (done) => {
  const company =
    '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada", "phone" : "211229sd"}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPhone);
    done();
  });
});

test('Create Company Invalid Full Name', (done) => {
  const company =
    '{"email": "salah.awad@outloook.com", "password": "admin@123", "username": "sawjjjada", "companyName": "Sam@!#$sh321..."}';

  const promise = controller.createNewCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongFullname);

    done();
  });
});

test('Fetch Company Successful by email', (done) => {
  const company = '{"email": "salah.awad@outlook.com"}';
  const promise = controller.fetchCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);

    done();
  });
});

test('Fetch Company not found', (done) => {
  const company = '{"email": "sassslah.awad@outlook.com"}';

  const promise = controller.fetchCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('An Error Occured While Fetching User', (done) => {
  const company =
    '{"email": "falseVal", "password": "company@123", "username": "samish"}';

  const promise = failingController.fetchCompany(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe('Error finding user');
    done();
  });
});

test('An Error Occured While Creating User', (done) => {
  const admin =
    '{"email": "sami.sss@yahoo.com", "password": "company@123", "username": "falseVal"}';

  const promise = failingController.createNewCompany(JSON.parse(admin));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('An Error Occured While Persisting User', (done) => {
  const admin =
    '{"email": "sami.sss@yahoo.com", "password": "company@123", "username": "trueVal"}';
  const promise = failingController.createNewCompany(JSON.parse(admin));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.PersistError);
    done();
  });
});

test('An Error Occured While Validating User (Email)', (done) => {
  const user = '{"username": "falseVal","code":"fff"}';

  const promise = failingController.validateEmailCode(JSON.parse(user));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});


test('Code Verification error', (done) => {
  const user = '{"username": "sawada","code":"aaa"}';


  const promise = controller.validateEmailCode(JSON.parse(user));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.CodeMismatch);
    done();
  });
});

test('Company Verify Successful', (done) => {
  const user = {username: 'sawada', code: 'fff'};
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve({
          _id: '999',
          email: 'salah.awad@outlook.com',
          password: 'admin@123',
          code_verifier: 'fff',
          pwd_reset_code: 'aaa',
          username: 'sawada',
          is_verified: false,
          isdeactivated: false,
        });
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      return 1;
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.validateEmailCode(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulValidated);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('An Error Occured While Finding User (password)', (done) => {
  const user = '{"email": "falseVal","code":"aaa"}';

  const promise = failingController.resetPassword(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed reset password, User Not Found', (done) => {
  const user = '{"email": "falseVal","code":"aaa"}';

  const promise = controller.resetPassword(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('An Error Occured code mismatch (password)', (done) => {
  const user = '{"email": "salah.awad@outlook.com","code":"afa"}';

  const promise = controller.resetPassword(JSON.parse(user));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.CodeMismatch);
    done();
  });
});

test('An Error Occured invalid password (password)', (done) => {
  const user =
    '{"email": "salah.awad@outlook.com","code":"aaa","newPassword":"ssss"}';

  const promise = controller.resetPassword(JSON.parse(user));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    done();
  });
});

test('Success reset password (password)', (done) => {
  const user =
    '{"email": "salah.awad@outlook.com","code":"aaa","newPassword":"Sami12@34"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve({
        email: 'salah.awad@outlook.com',
        username: 'sawada',
        is_verified: true,
        isdeactivated: false,
        pwd_reset_code: 'aaa',
        setPassword: function(x) {
          return 1;
        },
      });
    });
  });
  const promise = controller.resetPassword(JSON.parse(user));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.SuccessfulReset);
    findMock.mockRestore();
    done();
  });
});

test('An Error Occured While Resetting User Password', (done) => {
  const company = {email: 'falseVal', username: 'falseVal'};

  const promise = failingController.resetPassword(company);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Failed Sending Password Reset Code (User not found)', (done) => {
  const company = {email: 'salah.awad@outlook.com'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve(null);
    });
  });
  const promise = controller.sendPasswordCode(company.email);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Successfully Generated and Updated User Password Reset Code', (done) => {
  const company = {email: 'salah.awad@outlook.com'};
  // eslint-disable-next-line no-unused-vars
  const sendMock = jest.spyOn(Util, 'sendEmail');
  sendMock.mockImplementation((z, x, c, v, b) => {
    return true;
  });
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve) => {
      resolve({
        email: 'salah.awad@outlook.com',
        username: 'sawada',
        is_verified: true,
        isdeactivated: false,
        pwd_reset_code: 'aaa',
        generatePwdCode: function() {
          return 1;
        },
      });
    });
  });

  const promise = controller.sendPasswordCode(company.email);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Successful);
    expect(response.message).toBe(VadlidationStatus.Successful);
    done();
  });
});

test('An Error Occured While Sending User Password code', (done) => {
  const company = 'falseVal';

  const promise = failingController.sendPasswordCode(company);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('An Error Occured While Reactivating User Account', (done) => {
  const company = '{"email": "falseVal", "username": "samish"}';

  const promise = failingController.reactivate(JSON.parse(company));
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.Fail);
    done();
  });
});

test('Reactivation failed, User not found', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve(null);
    });
  });

  const promise = controller.reactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Successfully Reactivated User Account', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({
        email: 'salah.awad@outlook.com',
        username: 'sawada',
        is_verified: true,
        isdeactivated: true,
      });
    });
  });

  const promise = controller.reactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulSendRequest);
    expect(response.status).toBe(APIStatus.Successful);
    findMock.mockRestore();
    done();
  });
});

test('Successfully deactivated User Account', (done) => {
  const user = '{"username": "sawada"}';
  const promise = controller.deactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulDeactivate);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Deactivation failed, User not found', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve(null);
    });
  });

  const promise = controller.deactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('An Error Occured While Deactivating User Account', (done) => {
  const company = {email: 'falseVal', username: 'falseVal'};

  const promise = failingController.deactivate(company);
  promise.then((response) => {
    expect(response.status).toBe(APIStatus.Failed);
    expect(response.message).toBe(VadlidationStatus.FindError);
    done();
  });
});

test('Reactivation Failed User not Verified', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({
        email: 'salah.awad@outlook.com',
        username: 'sawada',
        is_verified: false,
        isdeactivated: false,
      });
    });
  });

  const promise = controller.deactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Verify);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Reactivation Failed User Already Deactivated', (done) => {
  const user = '{"username": "sawada"}';
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({
        email: 'salah.awad@outlook.com',
        username: 'sawada',
        is_verified: true,
        isdeactivated: true,
      });
    });
  });

  const promise = controller.deactivate(JSON.parse(user));
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Deactive);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Successfully Verified Account Email', (done) => {
  const user = {username: 'sawada', code: 'fff'};
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve({
          _id: '999',
          email: 'salah.awad@outlook.com',
          password: 'admin@123',
          code_verifier: 'fff',
          pwd_reset_code: 'aaa',
          username: 'sawada',
          is_verified: true,
          isdeactivated: false,
        });
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      return 1;
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.validateEmailCode(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulValidated);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Verifying Account Email (User not found)', (done) => {
  const user = {username: 'sawada', code: 'fff'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve(null);
    });
  });

  const promise = controller.validateEmailCode(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Failed Verifying Account Email (Code mismatch)', (done) => {
  const user = {username: 'sawada', code: 'bbb'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({
        _id: '999',
        email: 'salah.awad@outlook.com',
        password: 'admin@123',
        code_verifier: 'fff',
        pwd_reset_code: 'aaa',
        username: 'sawada',
        is_verified: true,
        isdeactivated: false,
      });
    });
  });

  const promise = controller.validateEmailCode(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.CodeMismatch);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Error occured while Verifying Account Email', (done) => {
  const user = {username: 'falseVal', code: 'fff'};

  const promise = failingController.validateEmailCode(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Successfully got Profile', (done) => {
  const user = {username: 'sawada'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({
        _id: '999',
        email: 'salah.awad@outlook.com',
        password: 'admin@123',
        code_verifier: 'fff',
        pwd_reset_code: 'aaa',
        username: 'sawada',
        is_verified: true,
        isdeactivated: false,
      });
    });
  });

  const promise = controller.getProfile(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    findMock.mockRestore();
    done();
  });
});

test('Failed getting Profile data (User not found)', (done) => {
  const user = {username: 'sawada'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve(null);
    });
  });

  const promise = controller.getProfile(user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Error getting Profile data', (done) => {
  const user = {username: 'falseVal'};

  const promise = failingController.getProfile(user.username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Successfully Updated User Profile', (done) =>{
  const username='sawada';
  const user ={'phone': '9999999'};
  const sendMock = jest.spyOn(Util, 'sendEmail');
  sendMock.mockImplementation((z, x, c, v, b)=>{
    return true;
  });
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      return new Promise((resolve)=>{
        resolve({x: 1});
      });
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.updateCompany(username, user);
  promise.then((response)=> {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Updating User Profile (Wrong Phone)', (done) =>{
  const username='sawada';
  const user ={'phone': 'abc'};
  const promise = controller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPhone);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Updating User Profile (Wrong email)', (done) =>{
  const username='sawada';
  const user ={'phone': '9999999', 'email': '123@,,311'};
  const promise = controller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Updating User Profile (Wrong Company name)', (done) =>{
  const username='sawada';
  const user ={'company_name': '9999999'};
  const promise = controller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongFullname);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Updating User Profile (Invalid Password)', (done) =>{
  const username='sawada';
  const user ={'password': '9999999'};
  const promise = controller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPassword);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Updating User Profile', (done) =>{
  const username='sawada';
  const user ={'password': 'sami@123'};
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve({
          _id: '999',
          email: 'salah.awad@outlook.com',
          password: 'admin@123',
          code_verifier: 'fff',
          pwd_reset_code: 'aaa',
          username: 'sawada',
          is_verified: true,
          isdeactivated: false,
        });
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      throw new Error(VadlidationStatus.UpdateError);
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Updating User Profile (User Not Found)', (done) =>{
  const username='sawadaaa';
  const user ={'password': 'sami@123'};
  const sendMock = jest.spyOn(Util, 'sendEmail');
  sendMock.mockImplementation((z, x, c, v, b)=>{
    return true;
  });
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      return new Promise((resolve)=>{
        resolve(null);
      });
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.updateCompany(username, user);
  promise.then((response)=>{
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    sendMock.mockRestore();
    done();
  });
});

test('Successfully Updated User Profile (Email Verification Required)', (done) =>{
  const username='sawada';
  const user ={'email': 'sami@123.com'};
  const sendMock = jest.spyOn(Util, 'sendEmail');
  sendMock.mockImplementation((z, x, c, v, b)=>{
    return true;
  });
  const companyprsister = {
    findCompanyOr: jest.fn(async (x) => {
      return new Promise((resolve)=>{
        resolve({
          _id: '999',
          email: 'salah.awad@outlook.com',
          password: 'admin@123',
          code_verifier: 'fff',
          pwd_reset_code: 'aaa',
          username: 'sawada',
          is_verified: true,
          isdeactivated: false,
        });
      });
    }),
    updateCompany: jest.fn(async (x, y)=>{
      return new Promise((resolve)=>{
        resolve({});
      });
    }),
  };
  const compaycontroller = new CompanyController(companyprsister);
  const promise = compaycontroller.updateCompany(username, user);
  promise.then((response)=> {
    expect(response.message).toBe(VadlidationStatus.SuccessfulUpdate);
    expect(response.data).toBe(VadlidationStatus.Verify);
    expect(response.status).toBe(APIStatus.Successful);
    sendMock.mockRestore();
    done();
  });
});

test('Failed Updating User Profile (Email Email Already Used by Another Account)', (done) =>{
  const username='sawada';
  const user ={'email': 'salah.awad@outlook.com'};
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((user) => {
    return new Promise((resolve)=>{
      resolve({'username': 'sami'});
    });
  }
  );
  const promise = controller.updateCompany(username, user);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.EmailFound);
    expect(response.status).toBe(APIStatus.Failed);
    findMock.mockRestore();
    done();
  });
});

test('Create Job, invalid email address', (done) =>{
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmailgmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

// test('Create Job, invalid website url', (done) =>{
//   const jobData = {
//     CompanyWebsite: 'www./website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
//     CompanyIndustry: 'IT',
//   };
//   const company = {username: 'sawada', id: '123'};
//   const promise = controller.createJob(company, jobData);
//   promise.then((response) => {
//     expect(response.message).toBe(VadlidationStatus.InvalidURL);
//     expect(response.status).toBe(APIStatus.Failed);
//     done();
//   });
// });

test('Create Job, invalid seniority level', (done) =>{
  const jobData = {
    SeniorityLevel: 'level level', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidSeniorityLevelInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, invalid Education level', (done) =>{
  const jobData = {
    EducationLevel: 'level level', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidEducationLevelInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, invalid Employement Time', (done) =>{
  const jobData = {
    EmploymentTime: 'time', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidEmploymentTimeInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Create Job, invalid Monthly Salary', (done) =>{
  const jobData = {
    MonthlySalary: 'hundred', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidMonthlySalaryInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, insufficient skills', (done) =>{
  const jobData = {
    MonthlySalary: '0-1000', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: [],
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InsufficientSkills);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, skill does not exist', (done) =>{
  const jobData = {
    MonthlySalary: '0-1000', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: ['NOTJAVA', 'C', 'C++'],
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SkillsUnavailable);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, insufficient skill', (done) =>{
  const jobData = {
    MonthlySalary: '0-1000', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: ['C', 'C++'],
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InsufficientSkills);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Create Job, invalid job description', (done) =>{
  const jobData = {
    JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', JobDescription: '' + chance.string({
      length: 251,
      pool: STRINGPASS,
    }) + '',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Job, invalid job title', (done) =>{
  const jobData = {
    Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', JobTitle: '' + chance.string({
      length: 251,
      pool: STRINGPASS,
    }) + '',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongTitle);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Create Job Error finding skill', (done) =>{
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: ['C', 'C++', 'JAVA'],
  };
  const company = {username: 'sawada', id: '123'};
  const MyMock = jest.spyOn(Persister, 'retrieveSkill');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Skill')));
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindSkillError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Create Job, Job title already used', (done) =>{
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Front End Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostTitleFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Create Job, Job Successfully Created', (done) =>{
  const MyMock = jest.spyOn(controller, 'alertSubscribers');
  MyMock.mockImplementation(() => Promise.resolve(1));
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    MyMock.mockRestore();
    done();
  });
});

test('Create Job Persist Error', (done) =>{
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const MyMock = jest.spyOn(Persister, 'persistJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Persisting User')));
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.PersistPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Create Job Update Error', (done) =>{
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const company = {username: 'sawada', id: '123'};
  const MyMock = jest.spyOn(Persister, 'updateCompanyJobs');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating User')));
  const promise = controller.createJob(company, jobData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Get job, job successfully found ', (done) => {
  const jobId = {_id: '123'};
  const promise = controller.getJob(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Get job, job not found ', (done) => {
  const jobId = '124';
  const promise = controller.getJob(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Get Job Find Error', (done) =>{
  const jobId = '123';
  const MyMock = jest.spyOn(Persister, 'findJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Job')));
  const promise = controller.getJob(jobId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Get jobs, user not found ', (done) => {
  const username = 'libroC';
  const promise = controller.getAllJobs(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Get All Jobs', (done) => {
  const username = 'sawada';
  const promise = controller.getAllJobs(username);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Get All Jobs, Find Jobs Error', (done) =>{
  const username = 'sawada';
  const MyMock = jest.spyOn(Persister, 'findAllJobs');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Jobs')));
  const promise = controller.getAllJobs(username);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindAllPostsError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Get All Jobs, Error Finding Company', (done) =>{
  const username = 'sawada';
  const MyMock = jest.spyOn(Persister, 'findCompanyOr');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding User')));
  const promise = controller.getAllJobs(username);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Update Job, invalid email address', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmailgmail.com',
    CompanyIndustry: 'IT',
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Update Job, insufficient skills', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: [],
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InsufficientSkills);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Job, one or more skills unavailable', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: ['C', 'Python', 'JAVA'],
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SkillsUnavailable);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Job, Job title already used', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Front End Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostTitleFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Job, successfully updated', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT', Skills: ['C', 'C++', 'JAVA'],
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.data.JobTitle).toBe(jobData.JobTitle);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Update Job, job not found', (done) =>{
  const jobId = '124';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Update Job Update Error', (done) =>{
  const jobId = '123';
  const companyId = '456';
  const jobData = {
    CompanyWebsite: 'www.website2.com', JobTitle: 'Web Developer', Email: 'contactmail@gmail.com',
    CompanyIndustry: 'IT',
  };
  const MyMock = jest.spyOn(Persister, 'updateJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Job')));
  const promise = controller.updateJob(companyId, jobId, jobData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Close Job, successfully closed', (done) =>{
  const jobId = '123';
  const promise = controller.closeJob(jobId);
  promise.then((response) => {
    expect(response.data.Fulfilled).toBe(true);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Success Search Companies, object', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve({email: 'test@gmail.com'}));
  const companyquery = {company_name: 'sawada', id: '999'};
  // const MyMock = jest.spyOn(Persister, 'persistJob');
  // MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Persisting User')));
  const promise = controller.search(companyquery);
  promise.then((response) => {
    // expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Success Search Companies, text', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve([{x: 1}, {x: 2}]));
  const companyquery = 'sami';
  const promise = controller.search(companyquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Close Job, job not found', (done) =>{
  const jobId = '456';
  const promise = controller.closeJob(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Searching Companies, invalid string ', (done) =>{
  const companyquery = 'm0Hm5GOlso27P5WViKG1XZCYHek1H0fORkjKSmYItnXkJFplF7CzfRJtZwObVypnzl5l4QIbEMf9BjsF7oU32176fdBN6AJXANhVos7SnGqURgnrb5Yqn5ZnpbkhuJVJRZvvOPlsXDhRU3p2a4A6phHjYlvPXg9YMCCaWhS1ROCgNPicjYLsUVNCMOtGQprgvCOCHfvNAn8N8AwroSaroTjqwRfJYKZ9lIp3rOCoc3It6HL6GggVy2vgUggdddd';
  const promise = controller.search({plain: companyquery});
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPlain);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Close Job Update Error', (done) =>{
  const jobId = '123';
  const MyMock = jest.spyOn(Persister, 'updateJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Job')));
  const promise = controller.closeJob(jobId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Failed Searching Companies, Result not Found  (text)', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve(null));
  const companyquery = 'hello';
  const promise = controller.search({plain: companyquery});
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate Job, successfully deactivated', (done) =>{
  const jobId = '123';
  const promise = controller.deactivateJob(jobId);
  promise.then((response) => {
    expect(response.data.isdeactivated).toBe(true);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Searching Companies, Result not Found  (object)', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve(null));
  const companyquery = {is_verified: false};
  const promise = controller.search(companyquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error Searching Companies', (done) =>{
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((x)=>{
    throw new Error(VadlidationStatus.SearchError);
  });
  const companyquery = {error: true, is_verified: false};
  const promise = controller.search(companyquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SearchError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Success Search Jobs, object', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve({email: 'test@gmail.com'}));
  const jobquery = {_id: '123'};
  const promise = controller.searchJob(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Deactivate Job, job not found', (done) =>{
  const jobId = '456';
  const promise = controller.deactivateJob(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Success Search Jobs, text', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve([{x: 1}, {x: 2}]));
  const companyquery = {plain: 'sami'};
  const promise = controller.searchJob(companyquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed Searching Jobs, invalid string ', (done) =>{
  const jobquery = 'm0Hm5GOlso27P5WViKG1XZCYHek1H0fORkjKSmYItnXkJFplF7CzfRJtZwObVypnzl5l4QIbEMf9BjsF7oU32176fdBN6AJXANhVos7SnGqURgnrb5Yqn5ZnpbkhuJVJRZvvOPlsXDhRU3p2a4A6phHjYlvPXg9YMCCaWhS1ROCgNPicjYLsUVNCMOtGQprgvCOCHfvNAn8N8AwroSaroTjqwRfJYKZ9lIp3rOCoc3It6HL6GggVy2vgUggdddd';
  const promise = controller.search({plain: jobquery});
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongPlain);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Searching Jobs, Result not Found  (text)', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve(null));
  const jobquery = 'hello';
  const promise = controller.search({plain: jobquery});
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed Searching Jobs, Result not Found  (object)', (done) =>{
  jest.spyOn(Persister, 'find').mockReturnValue(Promise.resolve(null));
  const jobquery = {audit_on: false};
  const promise = controller.search(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoResult);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate Job Update Error', (done) =>{
  const jobId = '123';
  const MyMock = jest.spyOn(Persister, 'updateJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Job')));
  const promise = controller.closeJob(jobId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Error Searching Jobs', (done) =>{
  const findMock = jest.spyOn(Persister, 'findCompanyOr');
  findMock.mockImplementation((x)=>{
    throw new Error(VadlidationStatus.SearchError);
  } );
  const jobquery = {JobTitle: '-1', audit_on: false};
  const promise = controller.searchJob(jobquery);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SearchError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Get jot with company, job not found', (done) => {
  const jobId = '456';
  const promise = controller.getJobWithCompany(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Get All Jobs, Find Job Error', (done) =>{
  const jobId = '123';
  const MyMock = jest.spyOn(Persister, 'findJob');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Jobs')));
  const promise = controller.getJobWithCompany(jobId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Get Job With Company, Error Finding Company', (done) =>{
  const jobId = {_id: '123'};
  const MyMock = jest.spyOn(Persister, 'findCompanyOr');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding User')));
  const promise = controller.getJobWithCompany(jobId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Create Project, invalid email address', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'emailgmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Project, invalid Years of Exprerience Input', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-7',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidYearsOfExperienceInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});


test('Create Project, invalid Budget input', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'ManHourBudget': '5',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidBudgetInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Project, invalid project description', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'emailgmail.com',
    'ProjectDescription': '' + chance.string({
      length: 251,
      pool: STRINGPASS,
    }) + '',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Project, invalid Seniority Level Input', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'level 1',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidSeniorityLevelInput);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Project, Porject with same title already exists', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostTitleFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Create Project, project successfully created', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const company = {username: 'sawada', id: '123'};
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Create Project Persist Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const company = {username: 'sawada', id: '123'};
  const MyMock = jest.spyOn(Persister, 'persistProject');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Persisting post')));
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.PersistPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Create Project Update Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const company = {username: 'sawada', id: '123'};
  const MyMock = jest.spyOn(Persister, 'updateCompanyProjects');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Company')));
  const promise = controller.createProject(company, projectData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Add Question, successfully added', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulAddQuestion);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed to Add Question, Qustion limit exceeded', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=['hi', 'hello', 'whatsapp', 'ola'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.QuestionOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Question, Wrong question type', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=2;
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionType);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Question, No question found', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=[];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoQuestionsFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Project, Project title already used', (done) =>{
  const projectId = '123';
  const companyId = '456';
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostTitleFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Question, Invalid question', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=[chance.string({length: 251, pool: STRINGPASS, symbol: true})];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Project, invalid email address', (done) =>{
  const projectId = '123';
  const companyId = '456';
  const projectData = {
    'ProjectTitle': 'Developer',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'emailgmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongEmail);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Question, Project does not exist', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devalopers',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=[chance.string({length: 25, pool: STRINGPASS, symbol: true})];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Project, project not found', (done) =>{
  const projectId = '124';
  const companyId = '456';
  const projectData = {
    'ProjectTitle': 'Developer',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers ',
  };
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Question, Questions exceeded limit', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  process.env.NbQuestions = 5;
  const questionData=chance.unique(chance.state, process.env.NbQuestions + 1);
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.QuestionOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Update Project, successfully updated project', (done) =>{
  const projectId = '123';
  const companyId = '456';
  const projectData = {
    'ProjectTitle': 'IOSDEVELOPMENT',
    'ProjectLength': '7 years',
  };
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(response.data.ProjectTitle).toBe(projectData.projectTitle);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Error while Adding Question, Find Post Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const MyMock = jest.spyOn(Persister, 'verifyProjectUnique');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.FindPostError)));
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Update Project Find Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const companyId = '456'; const projectId = '123';
  const MyMock = jest.spyOn(Persister, 'verifyProjectUnique');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error while finding post')));
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Error while Adding Question, Add Question Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const MyMock = jest.spyOn(Persister, 'addQuestions');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.AddQuestionError)));
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.AddQuestionError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Update Project Update Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper one',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const companyId = '456';
  const projectId = '123';
  const MyMock = jest.spyOn(Persister, 'updateProject');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Project')));
  const promise = controller.updateProject(companyId, projectId, projectData);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Update Question, successfully Updated', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData='ho';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulAddQuestion);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});
test('Close Project, successfully closed', (done) =>{
  const projectId = '123';
  const promise = controller.closeProject(projectId);
  promise.then((response) => {
    expect(response.data.Fulfilled).toBe(true);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed to Update Question, Index limit exceeded', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 3, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.IndexOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Close project, project not found', (done) =>{
  const projectId = '456';
  const promise = controller.closeProject(projectId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to update Question, Wrong question type', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=2;
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionType2);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Close Project Update Error', (done) =>{
  const projectId = '123';
  const MyMock = jest.spyOn(Persister, 'updateProject');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating project')));
  const promise = controller.closeProject(projectId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Failed to update Question, Invalid question', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=chance.string({length: 251, pool: STRINGPASS, symbol: true});
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate Project Update Error', (done) =>{
  const projectId = '123';
  const MyMock = jest.spyOn(Persister, 'updateProject');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating project')));
  const promise = controller.deactivateProject(projectId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdatePostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Failed to update Question, Project does not exist', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devalopers',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const questionData=chance.string({length: 25, pool: STRINGPASS, symbol: true});
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.ProjectNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Deactivate Project, successfully deactivated', (done) =>{
  const projectId = '123';
  const promise = controller.deactivateProject(projectId);
  promise.then((response) => {
    expect(response.data.isdeactivated).toBe(true);
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Error while updating Question, Find Post Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const MyMock = jest.spyOn(Persister, 'verifyProjectUnique');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.FindPostError)));
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindPostError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('deactivate project, project not found', (done) =>{
  const projectId = '456';
  const promise = controller.deactivateProject(projectId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Error while update Question, Add Question Error', (done) =>{
  const projectData = {
    'ProjectTitle': 'Devaloper',
    'ProjectLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'ProjectDescription': 'Devalopers',
  };
  const MyMock = jest.spyOn(Persister, 'updateQuestions');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.AddQuestionError)));
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateQuestions({id: company.id, projectTitle: projectData.ProjectTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UpdateQuestionError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Add Job Question, successfully added', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulAddQuestion);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Failed to Add job Question, Qustion limit exceeded', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=['hi', 'hello', 'whatsapp', 'ola'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.QuestionOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Job Question, Wrong question type', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=2;
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionType);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Job Question, No question found', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=[];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NoQuestionsFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Job Question, Invalid question', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=[chance.string({length: 251, pool: STRINGPASS, symbol: true})];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Job Question, job does not exist', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developers',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=[chance.string({length: 25, pool: STRINGPASS, symbol: true})];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.JobNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Failed to Add Job Question, Questions exceeded limit', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  process.env.NbQuestions = 3;
  const questionData=chance.unique(chance.state, process.env.NbQuestions + 1);
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.QuestionOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Error while Adding Job Question, Find Post Error', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const MyMock = jest.spyOn(Persister, 'verifyJobUnique');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.FindPostError)));
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindJobError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});
test('Error while Adding Job Question, Add Question Error', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const MyMock = jest.spyOn(Persister, 'addJobQuestions');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.AddQuestionError)));
  const questionData=['hi', 'hello'];
  const company = {username: 'sawada', id: '123'};
  const promise = controller.addJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.AddQuestionError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});
test('UpdateJob  Question, successfully Updated', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData='ho';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.SuccessfulAddQuestion);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});
test('Failed to Update Job Question, Index limit exceeded', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 3, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.IndexOutOfBound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Failed to update Job Question, Wrong question type', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=2;
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionType2);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Failed to update Job Question, Invalid question', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=chance.string({length: 251, pool: STRINGPASS, symbol: true});
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WrongQuestionDescription);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Failed to update Job Question, job does not exist', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developers',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const questionData=chance.string({length: 25, pool: STRINGPASS, symbol: true});
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.JobNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Error while updating Job Question, Find Post Error', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const MyMock = jest.spyOn(Persister, 'verifyJobUnique');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.FindPostError)));
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.FindJobError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

test('Error while update Job Question, Add Question Error', (done) =>{
  const jobData = {
    'jobTitle': 'Front End Developer',
    'jobLength': '2 years',
    'FixedBudget': '1000',
    'YearsOfExperience': '0-2',
    'SeniorityLevel': 'entry level',
    'Skills': 'c++',
    'Email': 'email@gmail.com',
    'jobDescription': 'Front End Developers',
  };
  const MyMock = jest.spyOn(Persister, 'updateJobQuestions');
  MyMock.mockImplementation(() => Promise.reject(new Error(VadlidationStatus.AddQuestionError)));
  const questionData='hi';
  const company = {username: 'sawada', id: '123'};
  const promise = controller.updateJobQuestions({id: company.id, jobTitle: jobData.jobTitle}, 0, questionData);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.UpdateQuestionError);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Get jobs with applicants, successfully found ', (done) => {
  const companyId = '456';
  const promise = controller.getJobsWithApplicants(companyId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Get jobs with applicants, not found', (done) => {
  const companyId = '567';
  const promise = controller.getJob(companyId);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.PostNotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Get jobsWithApplicants Find Error', (done) =>{
  const companyId = '456';
  const MyMock = jest.spyOn(Persister, 'findAllJobApp');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Applications')));
  const promise = controller.getJobsWithApplicants(companyId);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindAllPostsError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Rate Developer rating of invalid type', (done) => {
  const companyId = '999';
  const devId = '123';
  const updatedFields = {
    rating: 'string',
    comment: 'nice job',
  };
  const promise = controller.rateDeveloper(companyId, devId, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidRating);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});
test('Rate Developer rating > 5', (done) => {
  const companyId = '999';
  const devId = '123';
  const updatedFields = {
    rating: 7,
    comment: 'nice job',
  };
  const promise = controller.rateDeveloper(companyId, devId, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.InvalidRating);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Rate Developer, Company not found', (done) => {
  const companyId = '998';
  const devId = '123';
  const updatedFields = {
    rating: 4,
    comment: 'nice job',
  };
  const promise = controller.rateDeveloper(companyId, devId, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Rate Developer, Developer not found', (done) => {
  const companyId = '999';
  const devId = '133';
  const updatedFields = {
    rating: 4,
    comment: 'nice job',
  };
  const promise = controller.rateDeveloper(companyId, devId, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Rate Developer Successful', (done) => {
  const companyId = '999';
  const devId = '123';
  const updatedFields = {
    rating: 5,
    comment: 'nice job',
  };
  const promise = controller.rateDeveloper(companyId, devId, updatedFields);
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});


test('Rate Developer Find Error', (done) =>{
  const companyId = '999';
  const updatedFields = {
    rating: 5,
    comment: 'nice job',
  };
  const MyMock = jest.spyOn(Persister, 'findCompanyOr');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Finding Company')));
  const promise = controller.rateDeveloper(companyId, '123', updatedFields);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});


test('Rate Developer Update Error', (done) =>{
  const companyId = '999';
  const updatedFields = {
    rating: 5,
    comment: 'nice job',
  };
  const MyMock = jest.spyOn(Persister, 'updateDeveloper');
  MyMock.mockImplementation(() => Promise.reject(new Error('[Mocked Persister] Error Updating Developer')));
  const promise = controller.rateDeveloper(companyId, '123', updatedFields);
  promise.then((response) => {
    expect(MyMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    MyMock.mockRestore();
    done();
  });
});

