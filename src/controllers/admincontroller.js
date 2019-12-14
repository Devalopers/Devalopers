const {DevResponse, APIStatus} = require('../models/classes/DevResponse');
const Logger = require('./logger');
const {sendVerification, makeid, sendResetPasswordRequest} = require('./verificationcontroller');
const util = require('./utilities');
const MongooseHelper = require('../models/MongooseHelper');
const AdminModel= MongooseHelper.getModel('AdminModel');
const SkillModel= MongooseHelper.getModel('SkillModel');
const StatusModel= MongooseHelper.getModel('StatusModel');
const Validator= require('./validator');
const defaultAttributesUpdate = ['_id', 'created_on', 'Active'];
import {env} from '../env';
const userModels = {
  company: 'CompanyModel',
  admin: 'AdminModel',
  developer: 'DeveloperModel',
};
const currentUser = 'admin';

const VadlidationStatus={
  UsernameFound: 'username/Email already taken',
  EmailFound: 'Email already exists',
  MissingPassword: 'Password not set',
  MissingUsername: 'Username not set',
  WongPassword: 'Invalid password',
  InvalidCredentials: 'Username and password do not match',
  WrongUsername: 'Invalid username',
  WrongEmail: 'Invalid Email',
  WrongPhone: 'Invalid phone number',
  Successful: 'Successful',
  WrongFirstname: 'Invalid First name',
  WrongLastname: 'Invalid Lastt name',
  FindError: 'Error finding user',
  PersistError: 'Error persisting user',
  UpdateError: 'Error updating user',
  NotFound: 'User not found',
  AlreadyActive: 'Already Activated',
  NotActive: 'Account is not active',
  Deactivated: 'Account is deactivated',
  DeveloperNotExistent: 'Developer Does Not Exist',
  MailError: 'Can\'t mail target.',
  DeveloperNotLocked: 'Developer not locked.',
  RequestFindError: 'Request Not Found',
  RequestsNotFound: 'No activation requests were found',
  WrongSkillname: 'Invalid Skill Name',
  WrongDescription: 'Number of Characters exceeded limit',
  SkillFound: 'Skill Already Exists',
  UpdateSkillError: 'Error while updating skill',
  FindSkillError: 'Error while finding skill',
  PersistSkillError: 'Error while persisting skill',
  SkillDeactivated: 'Skill is deactivated',
  deleteError: 'Error Deleting Request',
  WrongStatusname: 'Invalid Status Name',
  StatusNotFound: 'Status Not Found',
  StatusFound: 'Status Already Exists',
  AssignError: 'Error assigning',
  DepriveError: 'Error depriving',
  DeveloperStatusCreationSuccess: 'Developer status created successfully.',
  DeveloperStatusAlreadyExists: 'Developer status already exists.',
  CannotPersistDeveloperStatus: 'Cannot persist developer status.',
  CannotSearchForDeveloperStatus: 'Cannot search For developer status.',
  InvalidName: 'Name is too long.',
  InvalidDescription: 'Description is too long.',
  UpdateDeveloperStatusSuccess: 'Update developer status succeeded.',
  DeveloperStatusNotFound: 'Developer status not found.',
  CannotUpdateDeveloperStatus: 'Cannot update developer status.',
  DeactivateDeveloperStatusSucceeds: 'Deactivate developer status succeeded.',
  DeveloperStatusAlreadyDeactivated: 'Developer status already deactivated.',
  InvalidUser: 'invalid user, only valid users are company, admin, and developer',
};

/**
 * test
 */
class AdminController {
  /**
   * constructor
   * @param {*} Persister custom persister
   */
  constructor(Persister) {
    this.Persister=Persister;
  }

  /**
 * Creates new admin profile
 * @param {object} data
 * @return {DevResponse}
 */
  async createNewAdmin(data) {
    const response = new DevResponse();
    const finalUser =new AdminModel(data);
    const generatedToken = makeid(10);
    const returnedValidation = validateAdmin(finalUser);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    finalUser.setPassword(finalUser.password);
    finalUser.verifier = generatedToken;
    return this.Persister.findAdmin(finalUser.username, finalUser.email).then( (usr) => {
      if (usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UsernameFound);
        Logger.logInfo('email or username already taken');
        return response;
      }
      //  Save Data to Database
      return this.Persister.persistAdmin(finalUser).then((user) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, user.filterData());
        Logger.logInfo('User Succesfully Created');
        sendVerification(currentUser, user.email, user.verifier);
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PersistError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }


  /**
 * Update an existing admin profile
 * @param {string} username
 * @param {object} data updated data
 * @return {DevResponse} response
 */
  async updateAdmin(username, data) {
    const response = new DevResponse();
    const tempUser = new AdminModel(data);
    const generatedToken = makeid(10);
    let sendEmailTrigger = false;
    const returnedValidation = validateAdmin(tempUser);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    if (tempUser.email) {
      tempUser.verifier = generatedToken;
      tempUser.Active = false;
      sendEmailTrigger = true;
    }
    if (tempUser.password) tempUser.setPassword(tempUser.password);
    const finalUser = tempUser.toObject();
    let key;
    for (key in finalUser) {
      if (defaultAttributesUpdate.includes(key)) {
        if ( key != 'Active' || !sendEmailTrigger ) delete finalUser[key];
      }
    }
    return this.Persister.findAdmin(null, finalUser.email).then( (user) => {
      if (user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.EmailFound);
        Logger.logInfo(VadlidationStatus.EmailFound);
        return response;
      }
      return this.Persister.updateAdmin(username, finalUser).then((usr)=>{
        if (usr) {
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, usr.filterData());
          Logger.logInfo('User Succesfully Updated');
          if (sendEmailTrigger) sendVerification(currentUser, usr.email, usr.verifier);
          return response;
        }
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User Not Found');
        return response;
      }).catch((error)=>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error )=>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
 * Deactivate an existing admin account
 * @param {string} username
 */
  async deactivateAdmin(username) {
    const response = new DevResponse();
    const deactivatedAdmin = {
      isdeactivated: true,
      audit_on: Date.now(),
    };
    return this.Persister.findAdmin(username).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User Not Found');
        return response;
      }
      if (usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
        Logger.logInfo('User already Deactivated');
        return response;
      }
      return this.Persister.updateAdmin(username, deactivatedAdmin).then(()=>{
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
        Logger.logInfo('User Successfully Deactivated');
        return response;
      }).catch((error) =>{
        Logger.logInfo(error.message);
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError);
        return response;
      });
    }).catch((error) =>{
      Logger.logInfo(error.message);
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      return response;
    });
  }


  /**
 * Get an existing admin account profile
 * @param {string} username
 */
  async getAdmin(username) {
    const response = new DevResponse();
    return this.Persister.findAdmin(username).then((user)=>{
      if (user) {
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, user.filterData());
        Logger.logInfo('User Profile Data Found');
        return response;
      }
      response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
      Logger.logInfo('User Not Found');
      return response;
    }).catch((error)=>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }
  /**
* Validate Admin Login
* @param {Object} user account data
* @return {Object} response
*/
  async validateAdminLogin(user) {
    const response = new DevResponse();
    return this.Persister.findAdmin(user.username, user.email).then((usr)=>{
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User does not exist');
        return response;
      }
      if (!usr.validatePassword(user.password)) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.InvalidCredentials);
        Logger.logInfo('username and password do not match');
        return response;
      }
      if (usr.Active && !usr.isdeactivated) {
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, usr);
        Logger.logInfo('Successful');
        return response;
      }
      if (!usr.Active && !usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotActive);
        Logger.logInfo('Account not active');
        return response;
      }
      response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
      Logger.logInfo('Account is Deactivated');
      return response;
    }).catch((error)=>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
* view all activation requests
*  @return {DevResponse} response
*/
  async getRequests() {
    const response = new DevResponse();

    return this.Persister.getRequests().then((users)=> {
      if (users) {
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, users);
        Logger.logInfo('Reactivation Requests Successfully Retrieved');
        return response;
      } else {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.RequestsNotFound);
        Logger.logInfo('No activation requests found');
        return response;
      }
    }).catch((err)=>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.RequestFindError);
      Logger.logInfo(err.message);
      return response;
    });
  }
  /**
* Accept Activation Request
* @param {function} username
*/
  async acceptRequest(username) {
    const response = new DevResponse();
    return this.Persister.findRequest({username}).then((user)=> {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.RequestsNotFound);
        Logger.logInfo('Request not found');
        return response;
      } else {
        return this.Persister.findCompanyOr({username}).then((finaluser)=>{
          if (!finaluser) {
            response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
            Logger.logInfo('User not found');
            return response;
          } else {
            if (!finaluser.isdeactivated) {
              response.fillResponse(APIStatus.Failed, VadlidationStatus.AlreadyActive);
              return response;
            }
            finaluser.isdeactivated=false;
            return this.Persister.updateCompany(username, {isdeactivated: false}).then((result)=> {
              return this.Persister.deleteRequestOr({username}).then((result)=>{
                response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
                Logger.logInfo('Successfully Reactivated Company');
                return response;
              }).catch((error)=>{
                response.fillResponse(APIStatus.Failed, VadlidationStatus.deleteError);
                Logger.logInfo('Error Deleting Request');
                return response;
              });
            }).catch((error) => {
              response.fillResponse(APIStatus.Failed, VadlidationStatus.UpdateError);
              Logger.logInfo('Error Reactivating Company');
              return response;
            });
          }
        }).catch((error)=>{
          response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
          Logger.logInfo('Error Finding Company');
          return response;
        });
      }
    }).catch((error)=>{
      response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
      Logger.logInfo('Error Finding Request');
      return response;
    });
  }

  /**
   * unlockDeveloper
   * @param {String} username
   */
  async unlockDeveloper(username) {
    const devResponse = new DevResponse();
    return this.Persister.findAdmin(username)
        .then((developer) => {
          if (developer) {
            if (developer.isLocked) {
              util.sendEmail(env.email_host,
                  username.email,
                  'Devalopers reset password request',
                  'Click the following link to verify your Email: '+env.app.siteurl+'/verify?' +
                  util.encodeQueryData({
                    user: 'developer',
                    username: username,
                    code: makeid(7),
                  }),
                  null);
              devResponse.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
              return devResponse;
            }
            devResponse.fillResponse(APIStatus.Failed, VadlidationStatus.DeveloperNotLocked);
            return devResponse;
          }
          devResponse.fillResponse(APIStatus.Failed, VadlidationStatus.DeveloperNotExistent);
          return devResponse;
        })
        .catch((error) => {
          devResponse.fillResponse(APIStatus.Failed, VadlidationStatus.FindError, error.message);
          return devResponse;
        });
  }
  /**
   * Create Skill
   * @param {Object} skill
   * @return {*}
   */
  async createSkill(skill) {
    const response = new DevResponse();
    const skillObj =new SkillModel(skill);
    const returnedValidation = validateSkill(skillObj);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findSkillOr({SkillName: skillObj.SkillName}).then( (usr) => {
      if (usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.SkillFound);
        Logger.logInfo('Skill Already Exists');
        return response;
      }
      //  Save Data to Database
      return this.Persister.persistSkill(skillObj).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Skill Succesfully Created');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PersistSkillError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindSkillError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * View Skill
   * @return {response}
   */
  async viewSkill() {
    const response = new DevResponse();
    // Check If User Is Already Created
    return this.Persister.findSkillAll({isdeactivated: false}).then( (usrs) => {
      if (usrs) {
        let data=[];
      	usrs.forEach(usr => {
          data.push(usr.filterData());
        });
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, data);
        Logger.logInfo('Skills Successfully Fetched from DB');
        return response;
      }
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindSkillError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Update Skill
   * @param {Object} skillObj
   * @return {response}
   */
  async updateSkill(skillObj) {
    const response = new DevResponse();
    const returnedValidation = validateSkill(skillObj);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.findSkillOr({SkillName: skillObj.SkillName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Skill not Found');
        return response;
      } else {
        return this.Persister.updateSkill(
            skillObj.SkillName,
            {
              SkillDescription: skillObj.SkillDescription,
              audit_on: Date.now(),
            }
        ).then((usr)=>{
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, usr.filterData());
          Logger.logInfo('User Succesfully Updated');
          return response;
        }).catch((error)=>{
          response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateSkillError);
          Logger.logInfo(error.message);
          return response;
        });
      }
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindSkillError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Deactivate Skill
   * @param {Object} skill
   * @return {*}
   */
  async deactivateSkill(skill) {
    const response = new DevResponse();
    const returnedValidation = validateSkill(skill);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findSkillOr({SkillName: skill.SkillName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Skill Not Found');
        return response;
      }
      if (usr && usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.SkillDeactivated);
        Logger.logInfo('Skill Already Deactivated');
        return response;
      }
      //  Save Data to Database
      // eslint-disable-next-line max-len
      return this.Persister.updateSkill(skill.SkillName, {isdeactivated: true, audit_on: Date.now()}).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Skill Succesfully Deactivated');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateSkillError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindSkillError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Reactivate Skill
   * @param {Object} skill
   * @return {*}
   */
  async reactivateSkill(skill) {
    const response = new DevResponse();
    const returnedValidation = validateSkill(skill);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findSkillOr({SkillName: skill.SkillName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Skill Not Found');
        return response;
      }
      if (usr && !usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.AlreadyActive);
        Logger.logInfo('Skill Already activate');
        return response;
      }
      //  Save Data to Database
      // eslint-disable-next-line max-len
      return this.Persister.updateSkill(skill.SkillName, {isdeactivated: false, audit_on: Date.now()}).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Skill Succesfully Reactivated');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateSkillError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindSkillError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
* Allows admin to reset frgotten password
* @param {string} email
*/
  async forgotPassword(email) {
    const response = new DevResponse();
    const generatedCode = makeid(20);
    const updatedFields = {passwordCode: generatedCode, audit_on: Date.now()};
    return this.Persister.findAdmin(null, email).then((user)=>{
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Account Not Found');
        return response;
      }
      if (user.isdeactivated) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.Deactivated);
        Logger.logInfo('Account Deactivated');
        return response;
      }
      return this.Persister.updateAdmin(user.username, updatedFields).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful);
        Logger.logInfo('Reset Password Request Successful');
        sendResetPasswordRequest(result.passwordCode, result.email, currentUser);
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
  /**
   * Create Status
   * @param {Object} status
   * @return {*}
   */
  async createStatus(status) {
    const response = new DevResponse();
    const statusObj =new StatusModel(status);
    const returnedValidation = validateStatus(statusObj);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findStatusOr({StatusName: statusObj.StatusName}).then( (usr) => {
      if (usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.StatusFound);
        Logger.logInfo('Status Already Exists');
        return response;
      }
      //  Save Data to Database
      return this.Persister.persistStatus(statusObj).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Status Succesfully Created');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PersistError, error);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Update Status
   * @param {Object} statusObj
   * @return {response}
   */
  async updateStatus(statusObj) {
    const response = new DevResponse();
    const returnedValidation = validateStatus(statusObj);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.findStatusOr({StatusName: statusObj.StatusName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Status not Found');
        return response;
      } else {
        return this.Persister.updateStatus(
            statusObj.StatusName,
            {
              StatusDescription: statusObj.StatusDescription,
              audit_on: Date.now(),
            }
        ).then((usr)=>{
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, usr.filterData());
          Logger.logInfo('User Succesfully Updated');
          return response;
        }).catch((error)=>{
          response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError, error);
          Logger.logInfo(error.message);
          return response;
        });
      }
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Deactivate Status
   * @param {Object} status
   * @return {*}
   */
  async deactivateStatus(status) {
    const response = new DevResponse();
    const returnedValidation = validateStatus(status);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findStatusOr({StatusName: status.StatusName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Status Not Found');
        return response;
      }
      if (usr && usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.deactivated);
        Logger.logInfo('Status Already Deactivate');
        return response;
      }
      //  Save Data to Database
      // eslint-disable-next-line max-len
      return this.Persister.updateStatus(status.StatusName, {isdeactivated: true, audit_on: Date.now()}).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Status Succesfully Deactivated');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Reactivate Status
   * @param {Object} status
   * @return {*}
   */
  async reactivateStatus(status) {
    const response = new DevResponse();
    const returnedValidation = validateStatus(status);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findStatusOr({StatusName: status.StatusName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Status Not Found');
        return response;
      }
      if (usr && !usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.AlreadyActive);
        Logger.logInfo('Status Already activate');
        return response;
      }
      //  Save Data to Database
      // eslint-disable-next-line max-len
      return this.Persister.updateStatus(status.StatusName, {isdeactivated: false, audit_on: Date.now()}).then((result) =>{
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, result.filterData());
        Logger.logInfo('Status Succesfully Reactivated');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * View Status
   * @return {response}
   */
  async viewStatus() {
    const response = new DevResponse();
    // Check If User Is Already Created
    return this.Persister.findStatusAll({isdeactivated: false}).then( (usrs) => {
      if (usrs) {
        let data=[];
      	usrs.forEach(usr => {
          data.push(usr.filterData());
        });
        response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, data);
        Logger.logInfo('Statuss Successfully Fetched from DB');
        return response;
      }
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Assign status to companies
   * @param {Object} company
   * @param {Object} status
   * @return {response}
   */
  async assign(company, status) {
    const response = new DevResponse();
    let returnedValidation = validateStatus(status);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    returnedValidation = Validator.validateUsername(company.username);
    if (!returnedValidation) {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.WrongUsername);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findStatusOr({StatusName: status.StatusName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Status Not Found');
        return response;
      }
      if (usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
        Logger.logInfo('Status Deactivated');
        return response;
      }
      //  Save Data to Database
      return this.Persister.findCompanyOr(company).then((result) =>{
        if (!result) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
          Logger.logInfo('Company Not Found');
          return response;
        }
        if (result.isdeactivated) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.deactivated);
          Logger.logInfo('Company Deactivated');
          return response;
        }
        if (result.company_status.includes(usr._id)) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.StatusFound);
          Logger.logInfo('Status Already Exists');
          return response;
        }
        return this.Persister.assignStatus(result.username, usr._id).then((final)=>{
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, final);
          Logger.logInfo('Status Succesfully Assigned');
          return response;
        }).catch((error)=>{
          response.fillResponse( APIStatus.Failed, VadlidationStatus.AssignError);
          Logger.logInfo(error.message);
          return response;
        });
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * deprive status from companies
   * @param {Object} company
   * @param {Object} status
   * @return {response}
   */
  async deprive(company, status) {
    const response = new DevResponse();
    let returnedValidation = validateStatus(status);

    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    returnedValidation = Validator.validateUsername(company.username);
    if (!returnedValidation) {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.WrongUsername);
      Logger.logInfo(returnedValidation);
      return response;
    }
    // Check If User Is Already Created
    return this.Persister.findStatusOr({StatusName: status.StatusName}).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Status Not Found');
        return response;
      }
      if (usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
        Logger.logInfo('Status Deactivated');
        return response;
      }
      //  Save Data to Database
      return this.Persister.findCompanyOr(company).then((result) =>{
        if (!result) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
          Logger.logInfo('Company Not Found');
          return response;
        }
        if (result.isdeactivated) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
          Logger.logInfo('Company Deactivated');
          return response;
        }
        if (!result.company_status.includes(usr._id)) {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.StatusNotFound);
          Logger.logInfo('Status Not Found');
          return response;
        }
        return this.Persister.depriveStatus(result.username, usr._id).then((final)=>{
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, final);
          Logger.logInfo('Status Succesfully Deprived');
          return response;
        }).catch((error)=>{
          response.fillResponse( APIStatus.Failed, VadlidationStatus.DepriveError, error);
          Logger.logInfo(error.message);
          return response;
        });
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError, error);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * createDeveloperStatus
   * @param {String} name
   * @param {String} description
   * @return {Promise}
   */
  async createDeveloperStatus(name, description) {
    const devResponse = new DevResponse();
    const validationResult = validateDeveloperStatus(name, description);
    if (validationResult != VadlidationStatus.Successful) {
      devResponse.fillResponse(
          APIStatus.Failed,
          validationResult
      );
      return devResponse;
    }
    return this.Persister.findDeveloperStatus(name)
        .then((developerStatus) => {
          if (developerStatus) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VadlidationStatus.DeveloperStatusAlreadyExists
            );
            return devResponse;
          }
          return this.Persister.addDeveloperStatus(name, description)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    VadlidationStatus.DeveloperStatusCreationSuccess
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    VadlidationStatus.CannotPersistDeveloperStatus
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              VadlidationStatus.CannotSearchForDeveloperStatus
          );
          return devResponse;
        });
  }

  /**
   *  updateDeveloperStatus
   * @param {String} name
   * @param {String} description
   * @return {Promise}
   */
  async updateDeveloperStatus(name, description) {
    const devResponse = new DevResponse();
    const validationResult = validateDeveloperStatus(name, description);
    if (validationResult != VadlidationStatus.Successful) {
      devResponse.fillResponse(
          APIStatus.Failed,
          validationResult
      );
      return devResponse;
    }
    return this.Persister.findDeveloperStatus(name)
        .then((developerStatus) => {
          if (!developerStatus) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VadlidationStatus.DeveloperStatusNotFound
            );
            return devResponse;
          }
          developerStatus.description = description;
          return this.Persister.updateDeveloperStatus(developerStatus)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    VadlidationStatus.UpdateDeveloperStatusSuccess
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    VadlidationStatus.CannotUpdateDeveloperStatus
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              VadlidationStatus.CannotSearchForDeveloperStatus
          );
          return devResponse;
        });
  }

  /**
   * deactivateDeveloperStatus
   * @param {String} name
   * @return {Promise}
   */
  async deactivateDeveloperStatus(name) {
    const devResponse = new DevResponse();
    return this.Persister.findDeveloperStatus(name)
        .then((developerStatus) => {
          if (!developerStatus) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VadlidationStatus.DeveloperStatusNotFound
            );
            return devResponse;
          }
          if (developerStatus.isDeactivated) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VadlidationStatus.DeveloperStatusAlreadyDeactivated
            );
            return devResponse;
          }
          developerStatus.isDeactivated = true;
          return this.Persister.updateDeveloperStatus(developerStatus)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    VadlidationStatus.DeactivateDeveloperStatusSucceeds
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    VadlidationStatus.CannotUpdateDeveloperStatus
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              VadlidationStatus.CannotSearchForDeveloperStatus
          );
          return devResponse;
        });
  }

  /**
   * deactivate profile of any user in the system
   * @param {String} username
   * @param {String} userType
   * @return {Promise}
   */
  async deactivateUserProfile(username, userType) {
    const response = new DevResponse();
    userType = userType.trim().toLowerCase();
    username = username.trim();
    if (!userModels[userType]) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.InvalidUser);
      Logger.logInfo('Invalid User');
      return response;
    }
    const Model = MongooseHelper.getModel(userModels[userType]);
    const deactivatedUser = {
      isdeactivated: true,
      audit_on: Date.now(),
    };
    return this.Persister.findUser(username, Model).then( (usr) => {
      if (!usr) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User Not Found');
        return response;
      }
      if (usr.isdeactivated) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.Deactivated);
        Logger.logInfo('User already Deactivated');
        return response;
      }
      return this.Persister.updateUser(usr.username, deactivatedUser, Model).then(()=>{
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
        Logger.logInfo('User Successfully Deactivated');
        return response;
      }).catch((error) =>{
        Logger.logInfo(error.message);
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateError);
        return response;
      });
    }).catch((error) =>{
      Logger.logInfo(error.message);
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      return response;
    });
  }
}

/**
 * validate the current admin
 * @param {*} finalUser the admin user
 * @return {*} status
 */
function validateAdmin(finalUser) {
  if (finalUser.password && !Validator.validPassword(finalUser.password)) {
    return VadlidationStatus.WongPassword;
  }
  if ( finalUser.username && !Validator.validateUsername(finalUser.username)) {
    return VadlidationStatus.WrongUsername;
  }

  if (finalUser.firstname && !(Validator.validFullName(finalUser.firstname)) ) {
    return VadlidationStatus.WrongFirstname;
  }
  if (finalUser.lastname && !(Validator.validFullName(finalUser.lastname)) ) {
    return VadlidationStatus.WrongLastname;
  }
  if ( finalUser.phonenumber && !(Validator.validPhoneNumber(finalUser.phonenumber))) {
    return VadlidationStatus.WrongPhone;
  }
  if (finalUser.email && !(Validator.validEmailAddress(finalUser.email)) ) {
    return VadlidationStatus.WrongEmail;
  }
  return VadlidationStatus.Successful;
}

/**
 * validate the current admin
 * @param {*} finalUser the admin user
 * @return {*} status
 */
function validateSkill(finalUser) {
  if ( !finalUser.SkillName || !Validator.validateSkillOrStatus(finalUser.SkillName)) {
    return VadlidationStatus.WrongSkillname;
  }
  if (finalUser.SkillDescription && !(Validator.validateDescription(finalUser.SkillDescription)) ) {
    return VadlidationStatus.WrongDescription;
  }
  return VadlidationStatus.Successful;
}

/**
 * validate the current admin
 * @param {*} finalUser the admin user
 * @return {*} status
 */
function validateStatus(finalUser) {
  if ( !finalUser.StatusName || !Validator.validateSkillOrStatus(finalUser.StatusName)) {
    return VadlidationStatus.WrongStatusname;
  }
  if (finalUser.StatusDescription && !(Validator.validateDescription(finalUser.StatusDescription)) ) {
    return VadlidationStatus.WrongDescription;
  }
  return VadlidationStatus.Successful;
}

/**
   * validateDeveloperStatus
   * @param {String} name
   * @param {String} description
   * @return {String} validation result
   */
function validateDeveloperStatus(name, description) {
  if (name && name.length >= 250) {
    return VadlidationStatus.InvalidName;
  }
  if (description && description.length >= 250) {
    return VadlidationStatus.InvalidDescription;
  }
  return VadlidationStatus.Successful;
}

module.exports = {
  AdminController: AdminController, VadlidationStatus: VadlidationStatus,
};
