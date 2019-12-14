const {DevResponse, APIStatus} = require('../models/classes/DevResponse');
require('../models/Developer');
require('../models/SavedJobs');
const path = require('path');
const Util = require('./utilities');
const MongooseHelper = require('../models/MongooseHelper');
const DeveloperModel = MongooseHelper.getModel('DeveloperModel');
const SavedJobModel = MongooseHelper.getModel('SavedJobsModel');
const JobApplicationModel = MongooseHelper.getModel('TechJobApp');
const ProjectApplicationModel = MongooseHelper.getModel('TechProjectApp');
const Validator = require('./validator');
const LOCK_THRESHOLD = 5;
const Logger = require('./logger');
const apihelper = require('./apihelper');

import {env} from '../env';
const RegisterDeveloperStatus ={
  ValidationStatus: {
    INVALID_ATTRIBUTES_PASSED: 'Invalid attributes',
    FindProjectError: 'Error Finding Project',
    ProjectApplicationExist: 'Project Application already sent',
    SuccessfulProjectApplicationPersist: 'Successfully saved Project Application',
    PersistProjectApplicationError: 'Error while persisting project application',
    FindProjectApplicationError: 'Error Finding Project Applications',
    SuccessfulGetProjectHistory: 'Sucessfully Got All Project Apply History',
    SuccessfulGetJobHistory: 'Successfully Got All Job Apply History',
    FindJobApplicationError: 'Error Finding Job Applications',
    INVALID_FILE: 'Invalid File type',
    ErrorUpload: 'Error Uploading File',
    JobApplicationExist: 'Job Application already sent',
    FindDeveloperError: 'Error Finding Developer',
    FindJobError: 'Error Finding Job',
    PersistjobApplicationError: 'Error while persisting job application',
    SuccessfulJobApplicationPersist: 'Successfully saved Job Application',
    UnequivlentResponse: 'Number of answers differs from number of questions',
    INVALID_LINK: 'Invalid Link',
    INVALID_USERNAME: 'Invalid Username',
    INVALID_PASSWORD: 'Invalid Password',
    INVALID_EMAIL: 'Invalid Email',
    INVALID_PHONE_NUMBER: 'Invalid Phone Number',
    INVALID_FIRST_NAME: 'Invalid first name',
    INVALID_LAST_NAME: 'Invalid last name',
    INVALID_LOCATION: 'Invalid location',
    INVALID_ADDRESS: 'Invalid address',
    INVALID_GENDER: 'Invalid gender',
    INVALID_LANGUAGE: 'Invalid language',
    INVALID_LANGUAGE_LEVEL: 'Invalid language level',
    INVALID_SENIORITY_LEVEL: 'Invalid seniority level',
    INVALID_YEARS_OF_EXPERIENCE: 'Invalid years of experience',
    INVALID_LOOKING_FOR: 'Invalid looking for',
    INVALID_EDUCATION_LEVEL: 'Invalid education level',
    INVALID_EDUCATION: 'Invalid education',
    INVALID_GITHUB_PROFILE_URL: 'Invalid github profile url',
    INVALID_LINKEDIN_PROFILE_URL: 'Invalid github profile url',
    INVALID_WORK_EXPERIENCE: 'Invalid work experience',
    INVALID_CERTIFICATIONS: 'Invalid certifications',
    SUCCESSFUL: 'Developer created successfully.',
    SearchError: 'Error Occurred While Searching',
    NoResult: 'Results not Found',
    WrongDescription: 'Invalid description',
    WrongAnswerType: 'Answers are not in an Array',
    WrongAnswerDescription: 'Invalid answer, too long',
    NoAnswersFound: 'No answers found',
    AnswerOutOfBound: 'Number of answers exceeded the limit (max 3)',
  },
  PersistorStatus: {
    CANNOT_SEARCH_FOR_DEVELOPER: 'Cannot search for developer',
    CANNOT_SEARCH_FOR_SKILL: 'Cannot search for developer skill',
    CANNOT_ADD: 'Cannot add developer',
    CANNOT_SUBSCRIBE: 'error subscribing/updating developer',

  },
  ONE_OR_MORE_SKILLS_UNAVAILABLE: 'One or more skills unavailable',
  INSUFFICIENT_SKILLS: 'A minimum of 3 skills should be added.',
  NO_CHANGE: 'No changes were given.',
  NO_SKILLS: 'No skills given',
  USERNAME_USED: 'Username or email used',
  EMAIL_USED: 'email already in database',
  SUCCESS: 'Succeeded',
};

const ResetPasswordStatus = {
  ValidationStatus: {
    INVALID_PASSWORD: 'Invalid password',
  },
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
    CANNOT_UPDATE: 'Cannot update developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer doesn\'t exist',
  TOKEN_INVALID: 'Invalid reset token',
  SUCCESS: 'Reset successfull',
};

const AccountAuthenticationStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
  },
  ACCOUNT_UNLOCKED: 'Account Unlocked',
  ACCOUNT_LOCKED: 'Account Locked',
  ACCOUNT_SEMILOCKED: 'Account Semilocked',
  ACCOUNT_NOT_FOUND: 'Account not found',
};

const DeactivateDeveloperStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
    CANNOT_UPDATE: 'Cannot update developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer doesn\'t exist.',
  ACCOUNT_ALREADY_DEACTIVATED: 'Account already deactivated.',
  SUCCESS: 'Account deactivated.',
};

const ReactivateDeveloperStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
    CANNOT_UPDATE: 'Cannot update developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer doesn\'t exist.',
  ACCOUNT_ALREADY_ACTIVATED: 'Account already activated.',
  SUCCESS: 'Account reactivated.',
};

const AddCapacityOfProjectsStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
    CANNOT_UPDATE: 'Cannot update developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer doesn\'t exist.',
  SUCCESS: 'Capacity of projects added.',
};
const EditDeveloperSkillsStatus = {
  PersistorError: {
    CANNOT_SEARCH_FOR_DEVELOPER: 'Cannot search for developer.',
    CANNOT_UPDATE_DEVELOPER: 'Cannot update developer.',
    CANNOT_SEARCH_FOR_SKILL: 'Cannot search for skill.',
  },
  DEVELOPER_DOESNT_EXIST: 'Targeted developer does not exist.',
  SOME_SKILLS_ARE_DEACTIVATED: 'Some skills are deactivated.',
  SOME_SKILLS_ARE_NOT_EXISTENT: 'Some skills are not existent.',
  SUCCESS: 'Skills edited successfully.',
};

const VerifyDeveloperStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
    CANNOT_UPDATE: 'Cannot update developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer does not exist',
  ACCOUNT_ALREADY_VERIFIED: 'Developer already verified',
  INCORRECT_VERIFIER: 'Verifier is incorrect.',
  SUCCESS: 'Email successfully verified.',
};

const ViewProfileStatus = {
  PersistorError: {
    CANNOT_SEARCH: 'Cannot search for developer',
  },
  DEVELOPER_DOESNT_EXIST: 'Developer does not exist',
  SUCCESS: 'View profile success.',
};

const EditDeveloperStatus = {
  PersistorError: RegisterDeveloperStatus.PersistorStatus,
  ValidationStatus: RegisterDeveloperStatus.ValidationStatus,
  ONE_OR_MORE_SKILLS_UNAVAILABLE: RegisterDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE,
  CHANGING_USERNAME_FORBIDDEN: 'Changing username is not allowed.',
  DEVELOPER_NOT_FOUND: 'Developer not found',
  DEVELOPER_UPDATED_SUCCESSFULLY: 'Developer updated successfully',
};

const ForgotPasswordStatus = {
  PersistorError: RegisterDeveloperStatus.PersistorStatus,
  DEVELOPER_NOT_FOUND: 'Developer not found',
  RESET_LINK_SENT: 'Link sent to email.',
};

const SaveJobStatus = {
  PersistorError: {
    CANNOT_UPDATE: 'Cannot update developer',
    CANNOT_SEARCH_FOR_COMPANY: 'Cannot search for company',
    CANNOT_SEARCH_FOR_DEVELOPER: 'Cannot search for developer',
    CANNOT_SEARCH_IF_JOB_EXISTS: 'Cannot search if job exists',
    CANNOT_SEARCH_FOR_JOB: 'Cannot search for job',
  },
  COMPANY_NOT_FOUND: 'Company not found',
  DEVELOPER_NOT_FOUND: 'Developer not found',
  JOB_NOT_FOUND: 'Job not found',
  JOB_ALREADY_SAVED: 'Job already saved',
  JOB_SAVED: 'Job saved to history',
};

const ViewSavedJobsStatus = {
  PersistorError: {
    CANNOT_SEARCH_FOR_SAVED_JOB: 'Cannot search for saved job',
  },
  RETRIEVE_SUCCESSFULL: 'Saved job history retrieved',
};
/**
 * DeveloperController
 */
class DeveloperController {
  /**
   * constructor
   * @param {DeveloperPersistor} developerPersistor
   */
  constructor(developerPersistor) {
    this.developerPersistor = developerPersistor;
  }

  /**
   * registerDeveloper
   * @param {RegisterDeveloperRequest} registerDeveloperRequest
   * @return {DevResponse} response
   */
  async registerDeveloper(registerDeveloperRequest) {
    const response = new DevResponse();
    const validationStatus = validateRegisterDeveloperFields(registerDeveloperRequest);
    if (validationStatus !== RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL) {
      response.fillResponse(
          APIStatus.Failed,
          validationStatus
      );
      return response;
    }
    for (const skillname of registerDeveloperRequest.skills) {
      try {
        const developerSkill = await this.developerPersistor.retrieveDeveloperSkill(skillname);
        if (!developerSkill) {
          response.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE
          );
          return response;
        }
      } catch (error) {
        response.fillResponse(
            APIStatus.Failed,
            RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_SKILL
        );
        return response;
      }
    }
    return this.developerPersistor
        .isDeveloperPresent(registerDeveloperRequest.username, registerDeveloperRequest.email)
        .then((isPresent) => {
          if (isPresent) {
            response.fillResponse(
                APIStatus.Failed,
                RegisterDeveloperStatus.USERNAME_USED
            );
            return response;
          }
          const developerModel = new DeveloperModel(registerDeveloperRequest);
          developerModel.setPassword(registerDeveloperRequest.password);
          developerModel.verifier = makeid(20);
          developerModel.location = apihelper.getLocation('80.81.156.38');
          return this.developerPersistor
              .persistDeveloper(developerModel)
              .then(() => {
                this.sendVerificationEmail(
                    registerDeveloperRequest.username,
                    registerDeveloperRequest.email,
                    developerModel.verifier
                );
                response.fillResponse(
                    APIStatus.Successful,
                    RegisterDeveloperStatus.SUCCESS
                );
                return response;
              })
              .catch((persistError) => {
                response.fillResponse(
                    APIStatus.Failed,
                    RegisterDeveloperStatus.PersistorStatus.CANNOT_ADD,
                    persistError
                );
                return response;
              });
        })
        .catch((persistError) => {
          response.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_DEVELOPER,
              persistError
          );
          return response;
        });
  }

  /**
   * @param {*} username
   * @param {*} email
   * @param {*} verifier
   */
  sendVerificationEmail(username, email, verifier) {
    Util.sendEmail(process.env.supportEmail,
        email,
        'activate account',
        '<html><a href="'+env.app.siteurl+'/developer/verify/' + username + '/' + verifier + '">Activate account</a></html>',
        'Verification link: '+env.app.siteurl+'developer/verify/' + username + '/' + verifier);
  }

  /**
   * @param {*} email
   * @param {*} verifier
   */
  sendForgotPasswordEmail(email, verifier) {
    Util.sendEmail(process.env.supportEmail,
        email,
        'Reset Password',
        '<html><a href="'+env.app.siteurl+'developer/requestresetpassword/' + email + '/' + verifier + '">Reset Password</a></html>',
        'Forget Password link: '+env.app.siteurl+'developer/requestresetpassword/' + email + '/' + verifier);
  }

  /**
   * notifyFailedAuthentication
   * @param {String} username
   * @return {DevResponse} response
   */
  async notifyFailedAuthentication(username) {
    const response = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            response.fillResponse(APIStatus.Failed, AccountAuthenticationStatus.ACCOUNT_NOT_FOUND);
            return response;
          }
          developer.failedLoginAttempts++;
          if (developer.failedLoginAttempts >= LOCK_THRESHOLD) {
            developer.isLocked = true;
            return this.developerPersistor.updateDeveloper(developer).then(() => {
              response.fillResponse(
                  APIStatus.Failed,
                  AccountAuthenticationStatus.ACCOUNT_LOCKED,
                  process.env.supportEmail
              );
              return response;
            });
          }
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                if (developer.failedLoginAttempts >= 3) {
                  response.fillResponse(
                      APIStatus.Failed,
                      AccountAuthenticationStatus.ACCOUNT_SEMILOCKED
                  );
                  return response;
                }
                response.fillResponse(
                    APIStatus.Failed,
                    AccountAuthenticationStatus.ACCOUNT_UNLOCKED
                );
                return response;
              })
              .catch((message) => {
                response.fillResponse(
                    APIStatus.Failed,
                    AccountAuthenticationStatus.PersistorError.CANNOT_UPDATE,
                    message);
                return response;
              });
        })
        .catch((message) => {
          response.fillResponse(APIStatus.Failed, AccountAuthenticationStatus.PersistorError.CANNOT_SEARCH, message);
          return response;
        });
  }

  /**
   * canLoginForSuccessfullAuthentication
   * @param {String} username
   * @return {DevResponse} response
   */
  async canLoginForSuccessfullAuthentication(username) {
    const response = new DevResponse();
    return this.developerPersistor
        .findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            response.fillResponse(
                APIStatus.Failed,
                AccountAuthenticationStatus.ACCOUNT_NOT_FOUND
            );
            return response;
          }
          if (developer.isLocked) {
            response.fillResponse(
                APIStatus.Failed,
                AccountAuthenticationStatus.ACCOUNT_LOCKED,
                process.env.supportEmail
            );
            return response;
          }
          developer.failedLoginAttempts = 0;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                response.fillResponse(
                    APIStatus.Successful,
                    AccountAuthenticationStatus.ACCOUNT_UNLOCKED
                );
                return response;
              })
              .catch((message) => {
                response.fillResponse(
                    APIStatus.Failed,
                    AccountAuthenticationStatus.PersistorError.CANNOT_UPDATE,
                    message
                );
                return response;
              });
        })
        .catch((message) => {
          response.fillResponse(
              APIStatus.Failed,
              AccountAuthenticationStatus.PersistorError.CANNOT_SEARCH, message);
          return response;
        });
  }

  /**
   * resetPasswordByToken
   * @param {String} email
   * @param {String} resetPasswordToken
   * @param {String} newPassword
   * @return {DevResponse} response
   */
  async resetPasswordByToken(email, resetPasswordToken, newPassword) {
    const response = new DevResponse();
    if (!Validator.validPassword(newPassword)) {
      response.fillResponse(
          APIStatus.Failed,
          ResetPasswordStatus.ValidationStatus.INVALID_PASSWORD
      );
      return response;
    }
    return this.developerPersistor.findDeveloper(null, email)
        .then((developer) => {
          if (!developer) {
            response.fillResponse(
                APIStatus.Failed,
                ResetPasswordStatus.DEVELOPER_DOESNT_EXIST
            );
            return response;
          }
          if (resetPasswordToken !== developer.reset_token) {
            response.fillResponse(
                APIStatus.Failed,
                ResetPasswordStatus.TOKEN_INVALID
            );
            return response;
          }
          developer = new DeveloperModel(developer);
          developer.setPassword(newPassword);
          developer.reset_token = null;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                response.fillResponse(
                    APIStatus.Successful,
                    ResetPasswordStatus.SUCCESS
                );
                return response;
              })
              .catch((message) => {
                response.fillResponse(
                    APIStatus.Failed,
                    ResetPasswordStatus.PersistorError.CANNOT_UPDATE,
                    message
                );
                return response;
              });
        })
        .catch((error) => {
          response.fillResponse(
              APIStatus.Failed,
              ResetPasswordStatus.PersistorError.CANNOT_SEARCH,
              error
          );
          return response;
        });
  }

  /**
   * Search in developer name and adescription
   * @param {String} txt
   * @return {DevResponse}
   */
  async search(txt) {
    const response = new DevResponse();
    if ( txt.plain && txt.plain.length>250) {
      response.fillResponse(APIStatus.Failed, RegisterDeveloperStatus.ValidationStatus.WrongDescription);
      return response;
    }
    if (txt.fullname && txt.fullname.length>250) {
      response.fillResponse(APIStatus.Failed, RegisterDeveloperStatus.ValidationStatus.INVALID_FULL_NAME);
      return response;
    }
    if (txt.username && txt.username.length>250) {
      response.fillResponse(APIStatus.Failed, RegisterDeveloperStatus.ValidationStatus.INVALID_USERNAME);
      return response;
    }
    return this.developerPersistor.searchDeveloper(txt).then((results) => {
      if (results==null || results== false) {
        response.fillResponse(
            APIStatus.Failed,
            RegisterDeveloperStatus.ValidationStatus.NoResult
        );
        // Logger.logInfo('Result Not Found');
        return response;
      }
      const data=[];
      results.forEach((result) => {
        data.push(
            {
              fullname: result.fullname,
              phonenumber: result.phonenumber,
              username: result.username,
              email: result.email,
              //     companyLink: process.env.localhost+'/developer/fetch?'+
              // Util.encodeQueryData({
              //   id: result._id,
              //   email: result.email,
              // }),
            });
      });
      response.fillResponse(APIStatus.Successful, RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL, data);
      // Logger.logInfo('Found '+data.length+' Results');
      return response;
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH_FOR_DEVELOPER, error.message);
      // Logger.logInfo(error.message);
      return response;
    });
  }
  /**
   * deactivateDeveloper
   * @param {String} username
   * @return {DevResponse} response
   */
  async deactivateDeveloper(username) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                DeactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          if (developer.isdeactivated) {
            devResponse.fillResponse(
                APIStatus.Failed,
                DeactivateDeveloperStatus.ACCOUNT_ALREADY_DEACTIVATED
            );
            return devResponse;
          }
          developer.isdeactivated = true;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    DeactivateDeveloperStatus.SUCCESS
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    DeactivateDeveloperStatus.PersistorError.CANNOT_UPDATE,
                    error
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              DeactivateDeveloperStatus.PersistorError.CANNOT_SEARCH,
              error
          );
          return devResponse;
        });
  }

  /**
   * reactivateDeveloper
   * @param {String} username
   * @return {DevResponse} response
   */
  async reactivateDeveloper(username) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                ReactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          if (!developer.isdeactivated) {
            devResponse.fillResponse(
                APIStatus.Failed,
                ReactivateDeveloperStatus.ACCOUNT_ALREADY_ACTIVATED
            );
            return devResponse;
          }
          developer.isdeactivated = false;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    ReactivateDeveloperStatus.SUCCESS
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    ReactivateDeveloperStatus.PersistorError.CANNOT_UPDATE,
                    error
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              ReactivateDeveloperStatus.PersistorError.CANNOT_SEARCH,
              error
          );
          return devResponse;
        });
  }

  /**
   * addCapacityOfProjects
   * @param {String} username
   * @param {String} capacity
   * @return {Promise}
   */
  async addCapacityOfProjects(username, capacity) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                AddCapacityOfProjectsStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          developer.capacityOfProjects = capacity;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    AddCapacityOfProjectsStatus.SUCCESS
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    AddCapacityOfProjectsStatus.PersistorError.CANNOT_UPDATE,
                    error
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              AddCapacityOfProjectsStatus.PersistorError.CANNOT_SEARCH,
              error
          );
          return devResponse;
        });
  }

  /**
   * editDeveloperSkills
   * @param {*} username
   * @param {*} skills
   * @return {Promise}
   */
  async editDeveloperSkills(username, skills) {
    const devResponse = new DevResponse();
    for (const skillname of skills) {
      try {
        const skill = await this.developerPersistor.retrieveDeveloperSkill(skillname);
        if (!skill) {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperSkillsStatus.SOME_SKILLS_ARE_NOT_EXISTENT
          );
          return devResponse;
        }
        if (skill.isdeactivated) {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperSkillsStatus.SOME_SKILLS_ARE_DEACTIVATED
          );
          return devResponse;
        }
      } catch (error) {
        devResponse.fillResponse(
            APIStatus.Failed,
            EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_SKILL
        );
        return devResponse;
      }
    }
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          developer.skills = skills;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    EditDeveloperSkillsStatus.SUCCESS
                );
                return devResponse;
              })
              .catch(() => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    EditDeveloperSkillsStatus.PersistorError.CANNOT_UPDATE_DEVELOPER
                );
                return devResponse;
              });
        })
        .catch(() => {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER
          );
          return devResponse;
        });
  }

  /**
   * @param {String} username
   * @param {String} verifier
   * @return {Promise}
   */
  async verifyAccount(username, verifier) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VerifyDeveloperStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          if (developer.isVerified) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VerifyDeveloperStatus.ACCOUNT_ALREADY_VERIFIED
            );
            return devResponse;
          }
          if (developer.verifier !== verifier) {
            devResponse.fillResponse(
                APIStatus.Failed,
                VerifyDeveloperStatus.INCORRECT_VERIFIER
            );
            return devResponse;
          }
          developer.verifier = null;
          developer.isVerified = true;
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                devResponse.fillResponse(
                    APIStatus.Successful,
                    VerifyDeveloperStatus.SUCCESS
                );
                return devResponse;
              })
              .catch((error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    VerifyDeveloperStatus.PersistorError.CANNOT_UPDATE
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              VerifyDeveloperStatus.PersistorError.CANNOT_SEARCH
          );
          return devResponse;
        });
  }

  /**
   * apply for a job
   * @param {*} developerUsername
   * @param {*} jobId
   * @param {*} cvFile
   * @param {*} answers
   * @return {Promise}
   */
  async applyJob(developerUsername, jobId, cvFile, answers) {
    const devResponse = new DevResponse();
    const cvExt = cvFile.name.split('.')[1];
    const cvPath = developerUsername+(new Date().getTime())+'.'+cvExt;
    if (!cvFile.name.match(/\.(pdf|doc|jpg)$/i)) {
      devResponse.fillResponse(
          APIStatus.Failed,
          RegisterDeveloperStatus.ValidationStatus.INVALID_FILE
      );
      return devResponse;
    }
    cvFile.mv(path.join(__dirname, '..', 'public', 'files', 'CV', cvPath ), (err) => {
      if (err) {
        devResponse.fillResponse(
            APIStatus.Failed,
            RegisterDeveloperStatus.ValidationStatus.ErrorUpload
        );
        return devResponse;
      }
      return null;
    });
    const CV=process.env.BASE_URL+'/public/files/CV/'+cvPath;
    const returnedValidation = validateApplication(CV, answers);
    if (returnedValidation != RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL) {
      devResponse.fillResponse(APIStatus.Failed, returnedValidation);
      // Logger.logInfo(returnedValidation);
      return devResponse;
    }
    return this.developerPersistor.findDeveloper(developerUsername)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          return this.developerPersistor.findJob(jobId)
              .then((job) => {
                if (job.questions.length != answers.length) {
                  devResponse.fillResponse(
                      APIStatus.Failed,
                      RegisterDeveloperStatus.ValidationStatus.UnequivlentResponse
                  );
                  return devResponse;
                }
                return this.developerPersistor.findJobApp(job._id, developer._id).then((existingApplication)=>{
                  if (existingApplication) {
                    devResponse.fillResponse(
                        APIStatus.Failed,
                        RegisterDeveloperStatus.ValidationStatus.JobApplicationExist
                    );
                    return devResponse;
                  }
                  const jobApplication = new JobApplicationModel();
                  jobApplication.JobTitle=job.JobTitle;
                  jobApplication.JobDescription= job.JobDescription;
                  jobApplication.JobId=job._id;
                  jobApplication.Company=job.Company;
                  jobApplication.Developer=developer._id;
                  jobApplication.CV=CV;
                  jobApplication.DeveloperName = developer.firstname + ' ' + developer.lastname;
                  jobApplication.answers= answers;
                  return this.developerPersistor.persistJobApplication(jobApplication).then((result)=>{
                    devResponse.fillResponse(
                        APIStatus.Successful,
                        RegisterDeveloperStatus.ValidationStatus.SuccessfulJobApplicationPersist
                    );
                    return devResponse;
                    // Logger.logInfo('successfully presisted user');
                  }).catch((error) => {
                    devResponse.fillResponse(
                        APIStatus.Failed,
                        RegisterDeveloperStatus.ValidationStatus.PersistjobApplicationError
                    );
                    return devResponse;
                  });
                });
              })
              .catch( (error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    RegisterDeveloperStatus.ValidationStatus.FindJobError
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.ValidationStatus.FindDeveloperError
          );
          return devResponse;
        });
  }

  /**
   * apply for a job
   * @param {*} devId
   * @return {Promise}
   */
  async jobApplicationHistory(devId) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findAllJobApp(devId)
        .then((jobs) => {
          if (!jobs || jobs.length == 0) {
            devResponse.fillResponse(
                APIStatus.Failed,
                RegisterDeveloperStatus.ValidationStatus.NoResult
            );
            return devResponse;
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              RegisterDeveloperStatus.ValidationStatus.SuccessfulGetJobHistory,
              jobs.filterData()
          );
          return devResponse;
        })
        .catch( (error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.ValidationStatus.FindJobApplicationError
          );
          return devResponse;
        });
  }

  /**
   * apply for a company Project
   * @param {*} developerUsername
   * @param {*} projectId
   * @param {*} cvFile
   * @param {*} answers
   * @return {Promise}
   */
  async applyProject(developerUsername, projectId, cvFile, answers) {
    const devResponse = new DevResponse();
    const cvExt = cvFile.name.split('.')[1];
    const cvPath = developerUsername+(new Date().getTime())+'.'+cvExt;
    if (!cvFile.name.match(/\.(pdf|doc|jpg)$/i)) {
      devResponse.fillResponse(
          APIStatus.Failed,
          RegisterDeveloperStatus.ValidationStatus.INVALID_FILE
      );
      return devResponse;
    }
    cvFile.mv(path.join(__dirname, '..', 'public', 'files', 'CV', cvPath ), (err) => {
      if (err) {
        devResponse.fillResponse(
            APIStatus.Failed,
            RegisterDeveloperStatus.ValidationStatus.ErrorUpload
        );
        return devResponse;
      }
      return null;
    });
    const CV=process.env.BASE_URL+'/public/files/CV/'+cvPath;
    const returnedValidation = validateApplication(CV, answers);
    if (returnedValidation != RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL) {
      devResponse.fillResponse(APIStatus.Failed, returnedValidation);
      // Logger.logInfo(returnedValidation);
      return devResponse;
    }
    return this.developerPersistor.findDeveloper(developerUsername)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST
            );
            return devResponse;
          }
          return this.developerPersistor.findProject(projectId)
              .then((project) => {
                if (project.questions.length != answers.length) {
                  devResponse.fillResponse(
                      APIStatus.Failed,
                      RegisterDeveloperStatus.ValidationStatus.UnequivlentResponse
                  );
                  return devResponse;
                }
                return this.developerPersistor.findProjectApp(project._id, developer._id).then((existingApplication)=>{
                  if (existingApplication) {
                    devResponse.fillResponse(
                        APIStatus.Failed,
                        RegisterDeveloperStatus.ValidationStatus.ProjectApplicationExist
                    );
                    return devResponse;
                  }
                  const projectApplication = new ProjectApplicationModel();
                  projectApplication.projectTitle=project.projectTitle;
                  // projectApplication.CompanyName=project.CompanyName;
                  projectApplication.projectDescription= project.projectDescription;
                  projectApplication.ProjectLength= project.ProjectLength;
                  projectApplication.ProjectTitle= project.ProjectTitle;
                  projectApplication.Project=project._id;
                  projectApplication.Developer=developer._id;
                  projectApplication.Company=project.Company;
                  projectApplication.CV=CV;
                  projectApplication.answers= answers;
                  return this.developerPersistor.persistProjectApplication(projectApplication).then((result)=>{
                    devResponse.fillResponse(
                        APIStatus.Successful,
                        RegisterDeveloperStatus.ValidationStatus.SuccessfulProjectApplicationPersist
                    );
                    return devResponse;
                    // Logger.logInfo('successfully presisted user');
                  }).catch((error) => {
                    devResponse.fillResponse(
                        APIStatus.Failed,
                        RegisterDeveloperStatus.ValidationStatus.PersistProjectApplicationError
                    );
                    return devResponse;
                  });
                });
              })
              .catch( (error) => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    RegisterDeveloperStatus.ValidationStatus.FindProjectError
                );
                return devResponse;
              });
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.ValidationStatus.FindDeveloperError
          );
          return devResponse;
        });
  }

  /**
   * apply for a job
   * @param {*} devId
   * @return {Promise}
   */
  async projectApplicationHistory(devId) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findAllProjectApp(devId)
        .then((jobs) => {
          if (!jobs || jobs.length == 0) {
            devResponse.fillResponse(
                APIStatus.Failed,
                RegisterDeveloperStatus.ValidationStatus.NoResult
            );
            return devResponse;
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              RegisterDeveloperStatus.ValidationStatus.SuccessfulGetProjectHistory,
              jobs.filterData()
          );
          return devResponse;
        })
        .catch( (error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.ValidationStatus.FindProjectApplicationError
          );
          return devResponse;
        });
  }

  /**
   * @param {*} username
   */
  async viewProfile(username) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findDeveloper(username)
        .then((developer) => {
          if (!developer) {
            devResponse.fillResponse(
                APIStatus.Failed,
                ViewProfileStatus.DEVELOPER_DOESNT_EXIST,
            );
            return devResponse;
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              ViewProfileStatus.SUCCESS,
              developer
          );
          return devResponse;
        })
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              ViewProfileStatus.PersistorError.CANNOT_SEARCH
          );
          return devResponse;
        });
  }

  /**
   * @param {String} username
   * @param {Object} editDeveloperParameters
   * @return {Promise}
   */
  async editDeveloper(username, editDeveloperParameters) {
    const devResponse = new DevResponse();
    if (Object.keys(editDeveloperParameters).length === 0) {
      devResponse.fillResponse(
          APIStatus.Successful,
          EditDeveloperStatus.NO_CHANGE
      );
      return devResponse;
    }
    if (Object.keys(editDeveloperParameters).includes('username')) {
      devResponse.fillResponse(
          APIStatus.Failed,
          EditDeveloperStatus.CHANGING_USERNAME_FORBIDDEN
      );
      return devResponse;
    }
    if (Object.keys(editDeveloperParameters).includes('skills')) {
      for (const skillname of editDeveloperParameters.skills) {
        try {
          const developerSkill = await this.developerPersistor.retrieveDeveloperSkill(skillname);
          if (!developerSkill || developerSkill.isdeactivated) {
            devResponse.fillResponse(
                APIStatus.Failed,
                EditDeveloperStatus.ONE_OR_MORE_SKILLS_UNAVAILABLE
            );
            return devResponse;
          }
        } catch (error) {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperStatus.PersistorError.CANNOT_SEARCH_FOR_SKILL
          );
          return devResponse;
        }
      }
    }
    const developer = await this.developerPersistor.findDeveloper(username)
        .catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER
          );
          return devResponse;
        });
    if (!developer) {
      devResponse.fillResponse(
          APIStatus.Failed,
          EditDeveloperStatus.DEVELOPER_NOT_FOUND
      );
      return devResponse;
    }
    for (const attr of Object.keys(editDeveloperParameters)) {
      if (Object.keys(DeveloperAttributesValidationMap).includes(attr)) {
        developer[attr] = editDeveloperParameters[attr];
      } else {
        devResponse.fillResponse(
            APIStatus.Failed,
            EditDeveloperStatus.ValidationStatus.INVALID_ATTRIBUTES_PASSED
        );
        return devResponse;
      }
    }
    const {validationMessage} = validate(developer.toObject(), {
      strict: false,
      except: editDeveloperParameters.password ? [] : ['password'],
    });
    if (validationMessage !== RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL) {
      devResponse.fillResponse(
          APIStatus.Failed,
          validationMessage
      );
      return devResponse;
    }
    if (editDeveloperParameters['password'] !== undefined) {
      developer.setPassword(developer.password);
    }
    developer.verifier = makeid(20);
    developer.isVerified = false;
    return this.developerPersistor
        .persistDeveloper(developer)
        .then(() => {
          if (editDeveloperParameters['email'] !== undefined) {
            this.sendVerificationEmail(
                developer.username,
                developer.email,
                developer.verifier
            );
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              EditDeveloperStatus.DEVELOPER_UPDATED_SUCCESSFULLY
          );
          return devResponse;
        })
        .catch((persistError) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              EditDeveloperStatus.PersistorError.CANNOT_ADD,
              persistError
          );
          return devResponse;
        });
  }


  /**
   * subscribe to job alerts
   * @param {String} username
   * @param {Object} reqData
   * @return {Promise}
   */
  async subsrcibeAlerts(username, reqData) {
    const devResponse = new DevResponse();
    const generatedToken = makeid(10);
    if (!Validator.validEmailAddress(reqData.email)) {
      devResponse.fillResponse(APIStatus.Failed, RegisterDeveloperStatus.ValidationStatus.INVALID_EMAIL);
      Logger.logInfo(RegisterDeveloperStatus.ValidationStatus.INVALID_EMAIL);
      return devResponse;
    }

Object.entries(reqData.SearchCriteria).length ? reqData.SearchCriteria.All = false : reqData.SearchCriteria.All = true;
reqData.UnsubscriptionKey = generatedToken;
return this.developerPersistor.verifyEmailUnique(reqData.email)
    .then((subscriber) => {
      if (subscriber && subscriber.username !== username) {
        devResponse.fillResponse(
            APIStatus.Failed,
            RegisterDeveloperStatus.EMAIL_USED
        );
        Logger.logInfo(RegisterDeveloperStatus.EMAIL_USED);
        return devResponse;
      }
      return this.developerPersistor.persistSubscriber(username, reqData)
          .then((result) => {
            devResponse.fillResponse(
                APIStatus.Successful,
                'Successfully Subscribed', result.SearchCriteria,
            );
            Logger.logInfo('Successfully Subscribed');
            return devResponse;
          }).catch((error) => {
            devResponse.fillResponse(
                APIStatus.Failed,
                RegisterDeveloperStatus.PersistorStatus.CANNOT_SUBSCRIBE
            );
            Logger.logInfo(error.message);
            return devResponse;
          });
    })
    .catch( (error) => {
      devResponse.fillResponse(
          APIStatus.Failed,
          RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH
      );
      Logger.logInfo(error.message);
      return devResponse;
    });
  }

  /**
   * unsubscribe to job alerts
   * @param {String} email
   * @param {String} verifier
   * @return {Promise}
   */
  async unsubsrcibeAlerts(email, verifier) {
    const devResponse = new DevResponse();
    return this.developerPersistor.deactivateSubscriber(email, verifier)
        .then((dev) => {
          if (!dev) {
            devResponse.fillResponse(
                APIStatus.Failed,
                AccountAuthenticationStatus.ACCOUNT_NOT_FOUND
            );
            Logger.logInfo(AccountAuthenticationStatus.ACCOUNT_NOT_FOUND);
            return devResponse;
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              'Successfully unSubscribed'
          );
          Logger.logInfo('Successfully unSubscribed');
          return devResponse;
        }).catch((error) => {
          devResponse.fillResponse(
              APIStatus.Failed,
              RegisterDeveloperStatus.PersistorStatus.CANNOT_SUBSCRIBE
          );
          Logger.logInfo(error.message);
          return devResponse;
        });
  }

  /**
   * @param {String} email
   * @return {String}
   */
  async forgotPassword(email) {
    const response = new DevResponse();
    return this.developerPersistor.findDeveloper(null, email)
        .then((developer) => {
          if (!developer) {
            response.fillResponse(
                APIStatus.Failed,
                ForgotPasswordStatus.DEVELOPER_NOT_FOUND
            );
            return response;
          }
          developer.reset_token = makeid(10);
          return this.developerPersistor.updateDeveloper(developer)
              .then(() => {
                this.sendForgotPasswordEmail(email, developer.reset_token);
                response.fillResponse(
                    APIStatus.Successful,
                    ForgotPasswordStatus.RESET_LINK_SENT
                );
                return response;
              })
              .catch(() => {
                response.fillResponse(
                    APIStatus.Failed,
                    ForgotPasswordStatus.PersistorError.CANNOT_UPDATE
                );
                return response;
              });
        })
        .catch(() => {
          response.fillResponse(
              APIStatus.Failed,
              ForgotPasswordStatus.PersistorError.CANNOT_SEARCH
          );
          return response;
        });
  }

  /**
   * @param {String} developerUsername
   * @param {String} companyUsername
   * @param {Number} jobID
   */
  async saveJob(developerUsername, companyUsername, jobID) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findCompany(companyUsername)
        .then((company) => {
          if (!company) {
            devResponse.fillResponse(
                APIStatus.Failed,
                SaveJobStatus.COMPANY_NOT_FOUND
            );
            return devResponse;
          }
          return this.developerPersistor.findDeveloper(developerUsername)
              .then((developer) => {
                if (!developer) {
                  devResponse.fillResponse(
                      APIStatus.Failed,
                      SaveJobStatus.DEVELOPER_NOT_FOUND
                  );
                  return devResponse;
                }
                return this.developerPersistor.findJob(jobID)
                    .then((job) => {
                      if (!job) {
                        devResponse.fillResponse(
                            APIStatus.Failed,
                            SaveJobStatus.JOB_NOT_FOUND
                        );
                        return devResponse;
                      }
                      return this.developerPersistor.doesJobExist(developerUsername, jobID)
                          .then((doesJobExist) => {
                            if (doesJobExist) {
                              devResponse.fillResponse(
                                  APIStatus.Failed,
                                  SaveJobStatus.JOB_ALREADY_SAVED
                              );
                              return devResponse;
                            }
                            const savedJob = new SavedJobModel();
                            savedJob.username = developer.username;
                            savedJob.jobID = jobID;
                            return this.developerPersistor.persistJobSave(savedJob)
                                .then(() => {
                                  devResponse.fillResponse(
                                      APIStatus.Successful,
                                      SaveJobStatus.JOB_SAVED,
                                  );
                                  return devResponse;
                                })
                                .catch(() => {
                                  devResponse.fillResponse(
                                      APIStatus.Failed,
                                      SaveJobStatus.PersistorError.CANNOT_UPDATE
                                  );
                                  return devResponse;
                                });
                          })
                          .catch(() => {
                            devResponse.fillResponse(
                                APIStatus.Failed,
                                SaveJobStatus.PersistorError.CANNOT_SEARCH_IF_JOB_EXISTS
                            );
                            return devResponse;
                          });
                    })
                    .catch(() => {
                      devResponse.fillResponse(
                          APIStatus.Failed,
                          SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_JOB
                      );
                      return devResponse;
                    });
              })
              .catch(() => {
                devResponse.fillResponse(
                    APIStatus.Failed,
                    SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER
                );
                return devResponse;
              });
        })
        .catch(() => {
          devResponse.fillResponse(
              APIStatus.Failed,
              SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_COMPANY
          );
          return devResponse;
        });
  }

  /**
   * @param {String} username
   * @param {String} offset
   * @param {String} length
   * @return {Promise}
   */
  async savedJobHistory(username, offset, length) {
    const devResponse = new DevResponse();
    return this.developerPersistor.findSavedJobs(username, offset, length)
        .then(async (savedJobs) => {
          const savedJobIDs = savedJobs.map((savedJob) => savedJob.jobID);
          const filteredSavedJobs = [];
          try {
            for (const jobID of savedJobIDs) {
              if (await this.developerPersistor.findJob(jobID)) {
                filteredSavedJobs.push(jobID);
              }
            }
          } catch (error) {
            devResponse.fillResponse(
                APIStatus.Failed,
                ViewSavedJobsStatus.PersistorError.CANNOT_SEARCH_FOR_SAVED_JOB
            );
            return devResponse;
          }
          devResponse.fillResponse(
              APIStatus.Successful,
              ViewSavedJobsStatus.RETRIEVE_SUCCESSFULL,
              filteredSavedJobs
          );
          return devResponse;
        })
        .catch(() => {
          devResponse.fillResponse(
              APIStatus.Failed,
              ViewSavedJobsStatus.PersistorError.CANNOT_SEARCH_FOR_SAVED_JOB
          );
          return devResponse;
        });
  }
}

const DeveloperAttributesValidationMap = {
  'username': (request) => {
    if (!Validator.validateUsername(request.username)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_USERNAME;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'password': (request) => {
    if (!Validator.validPassword(request.password)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_PASSWORD;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'email': (request) => {
    if (!Validator.validEmailAddress(request.email)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_EMAIL;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'phone': (request) => {
    if (!Validator.validPhoneNumber(request.phone)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_PHONE_NUMBER;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'firstname': (request) => {
    if (!Validator.validFullName(request.firstname)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_FIRST_NAME;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'lastname': (request) => {
    if (!Validator.validFullName(request.lastname)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_LAST_NAME;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'address': (request) => {
    if (!Validator.validateSimpleAddress(request.address)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_ADDRESS;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'gender': (request) => {
    if (!Validator.validateGender(request.gender)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_GENDER;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'languages': (request) => {
    if (!request.languages) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_LANGUAGE;
    }
    for (const language of request.languages) {
      if (!Validator.validateLanguage(language.name)) {
        return RegisterDeveloperStatus.ValidationStatus.INVALID_LANGUAGE;
      }
      if (!Validator.validateLanguageLevel(language.level)) {
        return RegisterDeveloperStatus.ValidationStatus.INVALID_LANGUAGE_LEVEL;
      }
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'seniorityLevel': (request) => {
    if (!Validator.validateSeniorityLevel(request.seniorityLevel)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_SENIORITY_LEVEL;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'yearsOfExperience': (request) => {
    if (!Validator.validateYearsOfExperience(request.yearsOfExperience)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_YEARS_OF_EXPERIENCE;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'lookingFor': (request) => {
    if (!Validator.validateLookingFor(request.lookingFor)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_LOOKING_FOR;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'educationLevel': (request) => {
    if (!Validator.validateEducationLevel(request.educationLevel)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION_LEVEL;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'education': (request) => {
    if (!Validator.validateEducation(request.educationLevel, request.education)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_EDUCATION;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'skills': (request) => {
    if (!request.skills || request.skills.length === 0) {
      return RegisterDeveloperStatus.NO_SKILLS;
    }
    if (request.skills.length < 3) {
      return RegisterDeveloperStatus.INSUFFICIENT_SKILLS;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'githubProfile': (request) => {
    if (!Validator.validateGithubProfile(request.githubProfile)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_GITHUB_PROFILE_URL;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'linkedInProfile': (request) => {
    if (!Validator.validateLinkedInProfile(request.linkedInProfile)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_LINKEDIN_PROFILE_URL;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'workExperience': (request) => {
    if (!Validator.validateWorkExperience(request.workExperience)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_WORK_EXPERIENCE;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
  'certifications': (request) => {
    if (!Validator.validateWorkExperience(request.certifications)) {
      return RegisterDeveloperStatus.ValidationStatus.INVALID_CERTIFICATIONS;
    }
    return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
  },
};

/**
 * @param {Object} object
 * @param {Object} options
 * @return {Object}
 */
function validate(object, options) {
  if (!options) {
    options = {};
  }
  if (options.except === undefined) {
    options.except = [];
  }
  if (options.requiredAttributes === undefined) {
    options.requiredAttributes = [];
  }
  for (const attr of options.requiredAttributes) {
    if (!Object.keys(object).includes(attr)) {
      return {isValid: false, validationMessage: 'Missing '+attr};
    }
  }
  for (const attr in object) {
    if (DeveloperAttributesValidationMap[attr] === undefined) {
      if (options.strict) {
        return {isValid: false, validationMessage: 'Extra attributes were passed.'};
      }
    } else {
      if (!options.except.includes(attr)) {
        const validationMessage = DeveloperAttributesValidationMap[attr](object);
        if (validationMessage !== RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL) {
          return {isValid: false, validationMessage};
        }
      }
    }
  }
  return {isValid: true, validationMessage: RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL};
}

/**
 * function
 * @param {*} registerDeveloperRequest
 * @return {*} status
 */
function validateRegisterDeveloperFields(registerDeveloperRequest) {
  return validate(registerDeveloperRequest, {
    requiredAttributes: [
      'username',
      'password',
      'email',
      'phone',
      'firstname',
      'lastname',
      'address',
      'gender',
      'languages',
      'seniorityLevel',
      'yearsOfExperience',
      'lookingFor',
      'educationLevel',
      'education',
      'skills',
    ],
    strict: true,
  }).validationMessage;
}

/**
 * function
 * @param {*} CV
 * @param {*} answers
 * @return {*} status
 */
function validateApplication(CV, answers) {
  // if (!Validator.validateWebsite(CV)) {
  //   return RegisterDeveloperStatus.ValidationStatus.INVALID_LINK;
  // }
  if (!Array.isArray(answers)) {
    return RegisterDeveloperStatus.ValidationStatus.WrongAnswerType;
  }
  if (answers.length == 0) {
    return RegisterDeveloperStatus.ValidationStatus.NoAnswersFound;
  }
  if (answers.length >3) {
    return RegisterDeveloperStatus.ValidationStatus.AnswerOutOfBound;
  }
  let invalid=false;
  answers.forEach((question)=>{
    if (question.length>250) {
      invalid=true;
    }
  });
  if (invalid) return RegisterDeveloperStatus.ValidationStatus.WrongAnswerDescription;
  return RegisterDeveloperStatus.ValidationStatus.SUCCESSFUL;
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
  DeveloperController,
  RegisterDeveloperStatus,
  ResetPasswordStatus,
  AccountAuthenticationStatus,
  DeactivateDeveloperStatus,
  ReactivateDeveloperStatus,
  AddCapacityOfProjectsStatus,
  EditDeveloperSkillsStatus,
  VerifyDeveloperStatus,
  ViewProfileStatus,
  EditDeveloperStatus,
  ForgotPasswordStatus,
  SaveJobStatus,
  ViewSavedJobsStatus,
};
