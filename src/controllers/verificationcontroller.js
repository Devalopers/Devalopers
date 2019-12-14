
const {DevResponse, APIStatus} = require('../models/classes/DevResponse');
const MongooseHelper = require('../models/MongooseHelper');
const Validator = require('./validator');
const Logger = require('./logger');
const util = require('./utilities');
import {env} from '../env';
const VadlidationStatus = {
  AlreadyActive: 'User already active',
  PersistError: 'Error persisting user',
  UpdateError: 'Error updating user',
  NotFound: 'User not found',
  FindError: 'Error finding user',
  InvalidUser: 'User invalid',
  Successful: 'Successful operation',
  WongPassword: 'password and username do not match',
};
const userModels = {
  company: 'CompanyModel',
  admin: 'AdminModel',
  developer: 'DeveloperModel',
};

/**
 * test
 */
class VerificationController {
  /**
   * constructor
   * @param {*} Persister custom persister
   */
  constructor(Persister) {
    this.Persister=Persister;
  }

  /**
 * verify User email address
 * @param {String} email
 * @param {String} verifier
 * @param {String} userType type of user [admin, company, developer]
 */
  async verifyEmail(email, verifier, userType) {
    const response = new DevResponse();
    if (!userModels[userType]) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
      Logger.logInfo('Invalid user');
      return response;
    }
    const Model = userModels[userType];
    return this.Persister.verifyEmail(email, verifier, Model).then((user)=>{
      if (user && !user.Active) {
        const updatedFields = {Active: true};
        return this.Persister.updateUser(user.username, updatedFields, Model).then(() => {
          response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
          Logger.logInfo('User Email Verified Succesfully');
          return response;
        }).catch((error)=>{
          response.fillResponse(APIStatus.Failed, VadlidationStatus.UpdateError);
          Logger.logInfo(error.message);
          return response;
        });
      }
      if (user && user.Active) {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.AlreadyActive);
        Logger.logInfo('User Email Already Verified');
        return response;
      }
      response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
      Logger.logInfo('Email does not exist in the database');
      return response;
    }).catch((error)=>{
      response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
* Allows User to reset forgotten password
* @param {string} passwordCode
* @param {string} password
* @param {String} userType type of user
*/
  async resetPassword(passwordCode, password, userType) {
    const response = new DevResponse();
    if (!userModels[userType]) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
      Logger.logInfo('Invalid User');
      return response;
    }
    const Model = MongooseHelper.getModel(userModels[userType]);
    if (!Validator.validPassword(password)) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WongPassword);
      Logger.logInfo('Invalid Password');
      return response;
    }

    let updatedUser = new Model();
    updatedUser.setPassword(password);
    updatedUser = {
      password: updatedUser.password,
      salt: updatedUser.salt,
    };
    return this.Persister.verifyPasswordCode(passwordCode, userModels[userType]).then((user)=>{
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User not found or token expired');
        return response;
      }
      return this.Persister.updateUser(user.username, updatedUser, userModels[userType]).then(() =>{
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
        Logger.logInfo('Succesfully Reset Password');
        return response;
      }).catch((error) =>{
        response.fillResponse(APIStatus.Failed, VadlidationStatus.UpdateError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error)=>{
      response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }
}
/**
 * Send Email Verification
 * @param {Stirng} user the user's type
 * @param {Stirng} email the user's email address
 * @param {String} verifier the email token
 */
function sendVerification(user, email, verifier) {
  const url = env.app.siteurl+ '/verification/verifyemail/?' + util.encodeQueryData({user: user, email: email, verifier: verifier}) + '';
  util.sendEmail(process.env.email_host, email, 'Verify Your Email!', null, url);
}

/**
* Send Reset Password Request
* @param {String} passwordCode the password code
* @param {String} email the admin's email
* @param {String} user the user's type
*/
function sendResetPasswordRequest(passwordCode, email, user) {
  const url = env.app.siteurl +'/verification/resetPassword/'+user+'/'+passwordCode+'';
  util.sendEmail(process.env.email_host, email, 'Reset Password!', null, url );
}


/**
 * Email Token Generator
 * @param {Number} n randomness digit
 * @return {String} generated token
 */
function makeid(n) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


module.exports = {
  VerificationController: VerificationController, VadlidationStatus: VadlidationStatus,
  sendVerification: sendVerification, makeid: makeid, sendResetPasswordRequest: sendResetPasswordRequest,
};

