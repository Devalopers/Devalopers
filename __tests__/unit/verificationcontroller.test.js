require('../../src/models/Admin.js');
require('../../src/models/Company.js');
const {
  VerificationController,
  VadlidationStatus,
} = require('../../src/controllers/verificationcontroller');
const {VerificationPersister} = require('../persistence/verificationpersister');
const {APIStatus} = require('../../src/models/classes/DevResponse');

const controller = new VerificationController(new VerificationPersister());

test('Email Verification User Email Not Found', (done) => {
  const email = 'salah.awad@gmail.com';
  const verifier = '123456';
  const promise = controller.verifyEmail(email, verifier, 'admin');
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Email Verification Error finding User', (done) => {
  const email = 'salah.awad@outlook.com';
  const verifier = '12345';
  const myMock = jest
      .spyOn(controller.Persister, 'verifyEmail')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.verifyEmail(email, verifier, 'admin');
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});


test('Email Verification Error persisting User', (done) => {
  const email = 'salah.awad@outlook.com';
  const verifier = '12345';
  const myMock = jest
      .spyOn(controller.Persister, 'updateUser')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Persisting User'))
      );
  const promise = controller.verifyEmail(email, verifier, 'admin');
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Email Already Active', (done) => {
  const email = 'salah.awad@outlook.com';
  const verifier = '12345';
  const myMock = jest
      .spyOn(controller.Persister, 'verifyEmail')
      .mockImplementation(() =>
        Promise.resolve(
            JSON.parse(
                '{"email": "salah.awad@outlook.com", "password": "admin@123", "username": "sawada", "verifier": "12345", "Active":true}'
            )
        )
      );
  const promise = controller.verifyEmail(email, verifier, 'admin');
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.AlreadyActive);
    expect(response.status).toBe(APIStatus.Successful);
    myMock.mockRestore();
    done();
  });
});


test('Email Verified Succesfully', (done) => {
  const email = 'salah.awad@outlook.com';
  const verifier = '12345';
  const promise = controller.verifyEmail(email, verifier, 'admin');
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});

test('Reset Password Invalid Password', (done) => {
  const password = 'admin@admin';
  const passwordCode = '12345';
  const promise = controller.resetPassword(passwordCode, password, 'admin');
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.WongPassword);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Reset Password invalid token or user not found', (done) => {
  const password = 'admin@123';
  const passwordCode = '14345';
  const promise = controller.resetPassword(passwordCode, password, 'admin');
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.NotFound);
    expect(response.status).toBe(APIStatus.Failed);
    done();
  });
});

test('Reset Password Find Error', (done) => {
  const passwordCode = '12345';
  const password = 'admin@123';
  const myMock = jest
      .spyOn(controller.Persister, 'verifyPasswordCode')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Finding User'))
      );
  const promise = controller.resetPassword(passwordCode, password, 'admin');
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.FindError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Reset Password Update Error', (done) => {
  const passwordCode = '12345';
  const password = 'admin@123';
  const myMock = jest
      .spyOn(controller.Persister, 'updateUser')
      .mockImplementation(() =>
        Promise.reject(new Error('[Mocked Persister] Error Updating User'))
      );
  const promise = controller.resetPassword(passwordCode, password, 'admin');
  promise.then((response) => {
    expect(myMock).toHaveBeenCalled();
    expect(response.message).toBe(VadlidationStatus.UpdateError);
    expect(response.status).toBe(APIStatus.Failed);
    myMock.mockRestore();
    done();
  });
});

test('Reset Password  Successful', (done) => {
  const password = 'admin@123';
  const passwordCode = '12345';
  const promise = controller.resetPassword(passwordCode, password, 'admin');
  promise.then((response) => {
    expect(response.message).toBe(VadlidationStatus.Successful);
    expect(response.status).toBe(APIStatus.Successful);
    done();
  });
});
