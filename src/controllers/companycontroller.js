/* eslint-disable no-control-regex */
const {DevResponse, APIStatus} = require('../models/classes/DevResponse');
const Logger = require('./logger');
const Util = require('./utilities');
const Validator = require('./validator');
const MongooseHelper = require('../models/MongooseHelper');
const CompanyModel = MongooseHelper.getModel('CompanyModel');
const JobModel = MongooseHelper.getModel('TechJob');
const ProjectModel = MongooseHelper.getModel('TechProject');
const defaultAttributesUpdate = ['_id', 'created_on', 'is_verified'];
import {env} from '../env';
const VadlidationStatus={
  ProjectNotFound: 'Project Not Found',
  JobNotFound: 'Job Not Found',
  FindJobError: 'Error Finding Job',
  FindSkillError: 'Error Finding Skill',
  UpdateQuestionError: 'Error while updating question',
  SuccessfulUpdateQuestion: 'Successfully Updated question',
  IndexOutOfBound: ' Index out of question Bound',
  NoQuestionsFound: 'Invalid Questions',
  AddQuestionError: 'Error while adding questions',
  SuccessfulAddQuestion: 'Successfully added questions',
  WrongQuestionDescription: 'Invalid question, too long',
  QuestionOutOfBound: 'Number of questions exceeded the limit (max '+ process.env.NbQuestions +')',
  WrongQuestionType: 'Questions are not in an array',
  WrongQuestionType2: 'Expected a string',
  WrongStatus: 'Invalid Status',
  WrongCompanysize: 'Invalid company size',
  SkillsUnavailable: 'One or more skills unavailable',
  InsufficientSkills: 'A minimum of 3 skills should be added.',
  WrongCompanyname: 'Invalid company name',
  WrongLocation: 'Invalid Location',
  WrongSalary: 'Invalid Salary',
  WrongTitle: 'Invalid Title',
  WrongPlain: 'Invalid plain text',
  WrongIndustry: 'Invalid Industry',
  SuccessfulUpdate: 'Successfully Updated User Profile',
  EmailFound: 'Email Already Exists',
  SuccessfulValidated: 'Successfully Validated Company Account',
  SuccessfulReset: 'Successfully Reset Password',
  FindAllPostsError: 'Error Finding All posts',
  SuccessfulSendRequest: 'Successfully Requested Reactivation',
  SuccessfulDeactivate: 'Successfully deactivated',
  SuccessfulComapnyPersist: 'Successfully Saved Company',
  UsernameFound: 'Email or username already taken',
  MissingPassword: 'Password not set',
  MissingUsername: 'Username not set',
  WrongPassword: 'Invalid password',
  WrongUsername: 'Invalid username',
  WrongEmail: 'Invalid Email',
  WrongPhone: 'Invalid phone number',
  Successful: 'Successful',
  WrongFullname: 'Invalid Fullname',
  FindError: 'Error finding user',
  PersistError: 'Error persisting user',
  CodeMismatch: 'Error matching code',
  Verify: 'User not verified',
  Active: 'User already activated',
  Deactive: 'User already deactivated',
  Fail: 'Error finding user',
  UpdateError: 'Error updating user',
  NotFound: 'User not found',
  WrongDescription: 'Invalid description, too long',
  NoResult: 'Results not Found',
  SearchError: 'Error Occurred While Searching',
  FindPostError: 'Error while finding post',
  PersistPostError: 'Error while persisting post',
  UpdatePostError: 'Error while updating post',
  PostTitleFound: 'post with same title already exists',
  PostNotFound: 'post does not exist',
  InvalidBudgetInput: 'Budget can either be fixed or man hour',
  InvalidSeniorityLevelInput: 'only possible values are: entry Level, junior level, mid-senior level, executive level',
  InvalidYearsOfExperienceInput: 'only possible values are: 0-2, 2-5, 5-10, 10-15, 15+',
  InvalidEducationLevelInput: 'only possible values are: na, high school degree, bachelors degree, masters degree, doctoral degree',
  InvalidEmploymentTimeInput: 'only possible values are: full time job, part time job, projects',
  InvalidMonthlySalaryInput: 'only possible values are: 0-1000, 1000-2000, 2000-3000, 3000-5000, 5000-10000, 10000+',
  InvalidURL: 'url is invalid',
  InvalidRating: 'rating should be a number and <= 5',
};

/**
 * test
 */
class CompanyController {
  /**
   * constructor
   * @param {*} Persister custom persister
   */
  constructor(Persister) {
    this.Persister = Persister;
  }

  /**
   * Create a new user
   * @param {CompanyModel} finalUserBody
   * @return {DevResponse} user is stored in the data if status is succesfull
   */
  async createNewCompany(finalUserBody) {
    const response = new DevResponse();
    const finalUser = new CompanyModel(finalUserBody);
    const returnedValidation = validateCompany(finalUserBody);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    finalUser.setPassword(finalUserBody.password);
    // Check If User Is Already Created
    return this.Persister.findCompanyOr({
      username: finalUser.username,
      email: finalUser.email,
    }).then((usr) => {
      if (usr) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.UsernameFound);
        Logger.logInfo('email or username already taken');
        return response;

        //  else if ((usr.phone == finalUser.phone) && (finalUser.phone != undefined)) {
        //   response.setMessage('phone number already used');
        //   response.setStatus(APIStatus.Failed);
        //   Logger.logInfo('phone number already used');
        //   return callback(response);
        // }
      }
      // Normalize and Save to Database
      const code = finalUser.generateVerifier();
      return this.Persister.persistCompany(finalUser).then((result) => {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulComapnyPersist);
        Logger.logInfo('successfully presisted user');
        Util.sendEmail(
            process.env.email_user,
            finalUserBody.email,
            'DEVALOPERS Verify Email',
            'Click the following link to verify your Email: '+ env.app.siteurl+'/company/verify?' +
              Util.encodeQueryData({
                id: finalUser._id,
                user: 'Company',
                code: code,
              }),
            null
        );
        return response;
      }).catch((error)=>{
        response.fillResponse(APIStatus.Failed, error.message, error);
        return response;
      });
    }).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message, error);
      return response;
    });
  }
  /**
   * Find a user by id or email
   * @param {String} user
   * @return {DevResponse}
   */
  async getProfile(user) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({username: user}).then((user) => {
      if (!user) {
        response.fillResponse(
            APIStatus.Failed,
            VadlidationStatus.FindError
        );
        Logger.logInfo('User Not Found');
        return response;
      }
      response.setMessage(VadlidationStatus.Successful);
      response.setData({
        message: 'Profile',
        email: user.email,
        username: user.username,
        companyName: user.company_name,
        phone: user.phone,
        status: user.status,
        jobs: user.Jobs,
      });
      response.setStatus(APIStatus.Successful);
      Logger.logInfo('Successfully viewed profile');
      return response;
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message, error);
      return response;
    });
  }

  /**
 * Update an existing Company
 * @param {string} username
 * @param {object} data
 * @return {DevResponse}
 */
  async updateCompany(username, data) {
    const response = new DevResponse();
    const tempUser = new CompanyModel(data);
    const generatedToken = tempUser.generateVerifier();
    let sendEmailTrigger = false;
    const returnedValidation = validateUpdates(data);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.setMessage(returnedValidation);
      response.setStatus(APIStatus.Failed);
      Logger.logInfo(returnedValidation);
      return response;
    } else {
      if (tempUser.email) {
        tempUser.verifier = generatedToken;
        tempUser.Active = false;
        sendEmailTrigger = true;
      }
      if (data.password) tempUser.setPassword(data.password);
      const finalUser = tempUser.toObject();
      finalUser.audit_on = Date.now();
      let key;
      for (key in finalUser) {
        if (defaultAttributesUpdate.includes(key)) {
          if (!sendEmailTrigger && key==='is_verified') {
            delete finalUser[key];
          } else if (key != 'is_verified') {
            delete finalUser[key];
          }
        }
      }
      return this.Persister.findCompanyOr({email: finalUser.email}).then((user) => {
        if (user && user.username != username ) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.EmailFound, 'User Email Already Used by Another Account');
          Logger.logInfo('User Email Already Used by Another Account');
          return response;
        } else {
          return this.Persister.updateCompany(username, finalUser).then((usr) => {
            if (usr && !sendEmailTrigger) {
              response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
              Logger.logInfo('User Successfully Updated');
              return response;
            } else if (usr && sendEmailTrigger) {
              response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulUpdate, VadlidationStatus.Verify);
              Logger.logInfo('User Succesfully Updated, Please verify new email address');
              Util.sendEmail(
                  process.env.email_user,
                  usr.email,
                  'DEVALOPERS Verify Email',
                  'Click the following link to verify your Email: '+ env.app.siteurl+'/company/verify?'+
                Util.encodeQueryData({username: username, user: 'Company', code: generatedToken}),
                  ''
              );
              return response;
            } else {
              response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
              Logger.logInfo('User Not Found');
              return response;
            }
          }).catch((error) => {
            response.fillResponse(APIStatus.Failed, VadlidationStatus.UpdateError, error.message);
            Logger.logInfo(error.message);
            return response;
          });
        }
      }).catch((error) => {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError, error.message);
        Logger.logInfo(error.message);
        return response;
      });
    }
  }


  /**
   * Find a user by id or email
   * @param {CompanyModel} finalUserBody
   * @return {DevResponse}
   */
  async fetchCompany(finalUserBody) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr(finalUserBody).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo('User Not Found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, user.filterData());
      Logger.logInfo('successfully fetched user');
      return response;
    }).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }

  /**
   * Find a Job by id
   * @param {JobModel} jobId
   * @return {DevResponse}
   */
  async fetchJob(jobId) {
    const response = new DevResponse();
    return this.Persister.findJob(jobId.id).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo('User Not Found');
        return response;
      }
      const data = {
        CompanyIndustry: user.CompanyIndustry,
        CompanyWebsite: user.CompanyWebsite,
        JobTitle: user.JobTitle,
        JobDescription: user.JobDescription,
        ThreeSkills: user.ThreeSkills,
        SeniorityLevel: user.SeniorityLevel,
        YearsOfExperience: user.YearsOfExperience,
        EductaionLevel: user.EductaionLevel,
        EmploymentTime: user.EmploymentTime,
        WeeklyWorkingHours: user.WeeklyWorkingHours,
        MonthlySalary: user.MonthlySalary,
        ClientInteraction: user.ClientInteraction,
        Presentation: user.Presentation,
        JobLocation: user.JobLocation,
        Country: user.Country,
        Traveling: user.Traveling,
        Onboarding: user.Onboarding,
        Email: user.Email,
        Fulfilled: user.Fulfilled,
      };
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, data);
      Logger.logInfo('successfully fetched job');
      return response;
    }).catch((error) => {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError, error.message);
      return response;
    });
  }


  /**
   * Validate Company email by comparing the code in finalUserBody with the one in the DB
   * @param {*} finalUserBody
   * @return {DevResponse}
   */
  async validateEmailCode(finalUserBody) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({username: finalUserBody.username}).then((user)=>{
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo('User Not Found');
        return response;
      } else if (user.code_verifier != finalUserBody.code) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.CodeMismatch, 'Code Mismatch');
        Logger.logInfo('Code Mismatch');
        return response;
      } else {
        return this.Persister.updateCompany(user.username, {is_verified: true, audit_on: Date.now()}).then((result) => {
          response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulValidated);
          Logger.logInfo('Successfully Verified User ');
          return response;
        }).catch((error)=>{
          response.fillResponse(APIStatus.Failed, error.message);
          return response;
        });
      }
    }).catch((error)=>{
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }

  /**
   * Get user email and send him/her generated password_code to verify the user
   * @param {*} userEmail
   * @return {DevResponse}
   */
  async sendPasswordCode(userEmail) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({email: userEmail}).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User Not Found');
        return response;
      }
      user.pwd_reset_code = user.generatePwdCode();
      user.audit_on = Date.now();
      return this.Persister.persistCompany(user).then((result) => {
        response.setMessage(VadlidationStatus.Successful);
        response.setData(
            'Code for resetting Password was sent to ' + user.email
        );
        response.setStatus(APIStatus.Successful);
        Logger.logInfo(
            'Successfully Generated and Updated User Password Reset Code'
        );
        Util.sendEmail(
            process.env.email_user,
            userEmail,
            'DEVALOPERS Reset Password',
            'Your code for resetting your Password: ' + user.pwd_reset_code,
            ''
        );
        return response;
      });
    }).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }
  /**
   * Reset Password if token recieved
   * @param {*} finalUser
   * @return {DevResponse}
   */
  async resetPassword(finalUser) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr(
        {email: finalUser.email}).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('User Not Found');
        return response;
      }
      if (
        user.pwd_reset_code != '' &&
            user.pwd_reset_code != finalUser.code
      ) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.CodeMismatch);
        Logger.logInfo('Reset Code Mismatch');
        return response;
      }
      if (!Validator.validPassword(finalUser.newPassword)) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongPassword);
        Logger.logInfo('Invalid New Password');
        return response;
      }
      user.setPassword(finalUser.newPassword);
      user.pwd_reset_code = '';
      user.audit_on = Date.now();
      return this.Persister.persistCompany(user).then((result) => {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulReset);
        Logger.logInfo('Successfully Updated Company Password');
        return response;
      });
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }

  /**
   * Deactivate Company account
   * @param {*} user holds user id that should be deactivated
   * @return {DevResponse}
   */
  async deactivate(user) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr(
        {username: user.username}).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo('User Not Found');
        return response;
      }
      if (user.isdeactivated) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.Deactive);
        Logger.logInfo('User Already Deactivated');
        return response;
      }
      if (!user.is_verified) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.Verify);
        Logger.logInfo('User Not Verified');
        return response;
      }
      user.isdeactivated = true;
      user.audit_on = Date.now();
      return this.Persister.persistCompany(user).then((result) => {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulDeactivate);
        Logger.logInfo('Successfully Deactivated Company Password');
        return response;
      });
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }

  /**
   * Reactivate Company account by  sending a request to Site Admins
   * @param {*} user holds user that requests reactivation
   * @return {DevResponse}
   */
  async reactivate(user) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr(
        {username: user.username, email: user.email}).then((user) => {
      if (!user) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo('User Not Found');
        return response;
      }
      if (!user.isdeactivated) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.Active);
        Logger.logInfo('User already active');
        return response;
      }
      if (!user.is_verified) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.Verify);
        Logger.logInfo('User not verified');
        return response;
      }
      return this.Persister.persistRequest({
        username: user.username,
        email: user.email,
        isdeactivated: user.isdeactivated,
        is_verified: user.is_verified,
      }).then((result) => {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.SuccessfulSendRequest);
        Logger.logInfo('Successfully Requested Company Reactivation');
        return response;
      });
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, error.message);
      return response;
    });
  }

  /**
   * Allows Company to create a new job
   * @param {Object} company
   * @param {Object} jobData holds job data
   * @return {DevResponse}
   */
  async createJob(company, jobData) {
    const response = new DevResponse();
    const job = new JobModel(jobData);
    job.Company = company.id;
    const returnedValidation = validateJob(job);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    if (job.Skills) {
      for (let i = 0; i<job.Skills.length; i++) {
        try {
          const skill = await this.Persister.retrieveSkill(job.Skills[i]);
          if (!skill) {
            response.fillResponse(APIStatus.Failed, VadlidationStatus.SkillsUnavailable);
            Logger.logInfo(VadlidationStatus.SkillsUnavailable);
            return response;
          }
        } catch (error) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.FindSkillError);
          Logger.logInfo(error.message);
          return response;
        }
      }
    }
    return this.Persister.verifyJobUnique(job.Company, job.JobTitle).then((foundJob) =>{
      if (foundJob && foundJob.length != 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PostTitleFound);
        Logger.logInfo('Job already exists');
        return response;
      }
      return this.Persister.persistJob(job).then((savedJob) => {
        return this.Persister.updateCompanyJobs(company.username, savedJob._id).then(() =>{
          response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, savedJob);
          Logger.logInfo('Successfully added job!');
          this.alertSubscribers(savedJob.toObject());
          return response;
        }).catch((error) =>{
          response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
          Logger.logInfo(error.message);
          return response;
        });
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PersistPostError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) => {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }
  /**
   * Search in company name and adescription
   * @param {String} txt
   * @return {DevResponse}
   */
  async search(txt) {
    const response = new DevResponse();
    if ( txt.plain && txt.plain.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongPlain);
      return response;
    }
    if (txt.company_name && txt.company_name.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongCompanyname);
      return response;
    }
    if (txt.company_description && txt.company_description.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongDescription);
      return response;
    }
    if (txt.company_size && txt.company_size.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongCompanySize);
      return response;
    }
    if (txt.phone && txt.phone.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongPhone);
      return response;
    }
    if (txt.company_status && txt.company_status.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongStatus);
      return response;
    }
    return this.Persister.searchCompany(txt).then((results) => {
      if (results==null || results== false) {
        response.fillResponse(
            APIStatus.Failed,
            VadlidationStatus.NoResult
        );
        Logger.logInfo('Result Not Found');
        return response;
      }
      const data=[];
      results.forEach((result) => {
        data.push(
            {
              companyName: result.company_name,
              companyDescription: result.company_description,
              companyLogo: result.company_logo,
              companyLink: env.app.siteurl+'/company/fetch?'+
          Util.encodeQueryData({
            id: result._id,
            email: result.email,
          }),
            });
      });
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, data);
      Logger.logInfo('Found '+data.length+' Results');
      return response;
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.SearchError);
      Logger.logInfo(error.message);
      return response;
    });
  }
  /**
   * Allows Company to get a job post
   * @param {*} jobId
   * @return {DevResponse}
   */
  async getJob(jobId) {
    const response = new DevResponse();
    return this.Persister.findJob(jobId).then((job) =>{
      if (!job || job.length == 0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo(' Job Not Found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, job);
      Logger.logInfo('Successfully Found job!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to get all job posts
   * @param {String} username
   * @return {DevResponse}
   */
  async getAllJobs(username) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({username: username}).then((company) => {
      if (!company) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Company Not Found');
        return response;
      }
      if (company.Jobs.length === 0) {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.NoResult);
        Logger.logInfo('No Jobs Posted');
        return response;
      }
      return this.Persister.findAllJobs(company.Jobs).then((jobList) => {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, jobList);
        Logger.logInfo('Successfully Found jobs!');
        return response;
      }).catch((error) => {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindAllPostsError);
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
   * Allows Company to get a job post and its details
   * @param {*} jobId
   * @return {DevResponse}
   */
  async getJobWithCompany(jobId) {
    const response = new DevResponse();
    return this.Persister.findJob(jobId).then((job) =>{
      if (!job || job.length == 0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo(' Job Not Found');
        return response;
      }
      return this.Persister.findCompanyOr({_id: job.Company}).then((company) => {
        job = job.toObject() || job;
        job.Company = company;
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, job);
        Logger.logInfo('Successfully Found job and company details!');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }


  /**
   * Search in Job name and adescription
   * @param {String} txt
   * @return {DevResponse}
   */
  async searchJob(txt) {
    const response = new DevResponse();
    if ( txt.plain && txt.plain.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongPlain);
      return response;
    }
    if (txt.CompanyIndustry && txt.CompanyIndustry.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongIndustry);
      return response;
    }
    if (txt.JobTitle && txt.JobTitle.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongTitle);
      return response;
    }
    if (txt.JobDescription && txt.JobDescription.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongDescription);
      return response;
    }
    if (txt.MonthlySalary && txt.MonthlySalary.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongSalary);
      return response;
    }
    if (txt.JobLocation && txt.JobLocation.length>250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongLocation);
      return response;
    }


    return this.Persister.searchJob(txt).then((results) => {
      if (results==null || results== false) {
        response.fillResponse(
            APIStatus.Failed,
            VadlidationStatus.NoResult
        );
        Logger.logInfo('Result Not Found');
        return response;
      }
      const data=[];
      results.forEach((result) => {
        data.push(
            {
              // TODO Create a Fetch Job API
              JobTitle: result.JobTitle,
              MonthlySalary: result.MonthlySalary,
              YearsOfExperience: result.YearsOfExperience,
              JobLocation: result.JobLocation,
              JobLink: env.app.siteurlt+'/company/fetchJob?'+
          Util.encodeQueryData({
            id: result._id,
          }),
            });
      });
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, data);
      Logger.logInfo('Found '+data.length+' Results');
      return response;
    }
    ).catch((error) => {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.SearchError, error.message);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to update job post
   * @param {*} companyId
   * @param {*} jobId
   * @param {Object} jobData
   * @return {DevResponse}
   */
  async updateJob(companyId, jobId, jobData) {
    const response = new DevResponse();
    const updatedJob = normalizeInput(jobData);
    const returnedValidation = validateJob(updatedJob);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    if (updatedJob.Skills) {
      for (let i = 0; i<updatedJob.Skills.length; i++) {
        try {
          const skill = await this.Persister.retrieveSkill(updatedJob.Skills[i]);
          if (!skill) {
            response.fillResponse(APIStatus.Failed, VadlidationStatus.SkillsUnavailable);
            Logger.logInfo(VadlidationStatus.SkillsUnavailable);
            return response;
          }
        } catch (error) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
          Logger.logInfo(error.message);
          return response;
        }
      }
    }
    return this.Persister.verifyJobUnique(companyId, updatedJob.JobTitle).then((foundJob) =>{
      if (foundJob && foundJob.length != 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PostTitleFound);
        Logger.logInfo('Job title already used');
        return response;
      }
      return this.Persister.updateJob(jobId, updatedJob).then((job) =>{
        if (!job || job.length == 0) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
          Logger.logInfo('job not found');
          return response;
        }
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, job);
        Logger.logInfo('Successfully Updated job!');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to close job post
   * @param {*} jobId
   * @return {DevResponse}
   */
  async closeJob(jobId) {
    const response = new DevResponse();
    const closeJobSettings = {
      Fulfilled: true,
      audit_on: Date.now(),
    };
    return this.Persister.updateJob(jobId, closeJobSettings).then((job) =>{
      if (!job || job.length==0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo('job not found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, job);
      Logger.logInfo('Successfully Closed job!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
      Logger.logInfo(error.message);
      return response;
    });
  }
  /**
   * Allows Company to deactivate job post
   * @param {*} jobId
   * @return {DevResponse}
   */
  async deactivateJob(jobId) {
    const response = new DevResponse();
    const deactivateJobSettings = {
      isdeactivated: true,
      audit_on: Date.now(),
    };
    return this.Persister.updateJob(jobId, deactivateJobSettings).then((job) =>{
      if (!job || job.length==0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo('job not found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, job);
      Logger.logInfo('Successfully Deactivated job!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to create a new job
   * @param {Object} company holds company id and username
   * @param {Object} projectData holds project data
   * @return {DevResponse}
   */
  async createProject(company, projectData) {
    const response = new DevResponse();
    const project = new ProjectModel(projectData);
    project.Company = company.id;
    // validation check
    const returnedValidation = validateProject(project);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.verifyProjectUnique(project.Company, project.ProjectTitle)
        .then((foundPost) =>{
          if (foundPost && foundPost.length != 0) {
            response.fillResponse( APIStatus.Failed, VadlidationStatus.PostTitleFound);
            Logger.logInfo('Post with same title already exists');
            return response;
          }
          return this.Persister.persistProject(project).then((savedProject) => {
            return this.Persister.updateCompanyProjects(company.username, savedProject._id).then(() =>{
              response.fillResponse( APIStatus.Successful, VadlidationStatus.Successful, savedProject);
              Logger.logInfo('Successfully added Project!');
              return response;
            }).catch((error) =>{
              response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
              Logger.logInfo(error.message);
              return response;
            });
          }).catch((error) =>{
            response.fillResponse( APIStatus.Failed, VadlidationStatus.PersistPostError);
            Logger.logInfo(error.message);
            return response;
          });
        }).catch((error) => {
          response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
          Logger.logInfo(error.message);
          return response;
        });
  }

  /**
   * Allows Company to get all projects
   * @param {String} username
   * @return {DevResponse}
   */
  async getAllProjects(username) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({username: username}).then((company) => {
      if (!company) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Company Not Found');
        return response;
      }
      if (company.Projects.length === 0) {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.NoResult);
        Logger.logInfo('No Projects Posted');
        return response;
      }
      return this.Persister.findAllProjects(company.Projects).then((projectList) => {
        const filteredProjectList = [];
        projectList.forEach((project)=>{
          filteredProjectList.push(project.filterData());
        });
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, filteredProjectList);
        Logger.logInfo('Successfully Found Projects!');
        return response;
      }).catch((error) => {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindAllPostsError);
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
   * Allows Company to get a job post
   * @param {*} projectId
   * @return {DevResponse}
   */
  async getProject(projectId) {
    const response = new DevResponse();
    return this.Persister.findProject(projectId).then((project) =>{
      if (!project || project.length == 0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo(' Project Not Found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, project.filterData());
      Logger.logInfo('Successfully Found Project!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to update job post
   * @param {*} companyId
   * @param {*} projectId
   * @param {Object} projectData
   * @return {DevResponse}
   */
  async updateProject(companyId, projectId, projectData) {
    const response = new DevResponse();
    projectData = normalizeInput(projectData);
    const returnedValidation = validateProject(projectData);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse( APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.verifyProjectUnique(companyId, projectData.ProjectTitle).then((foundPost) =>{
      if (foundPost && foundPost != 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PostTitleFound);
        Logger.logInfo('Project title already used');
        return response;
      }
      return this.Persister.updateProject(projectId, projectData).then((project) =>{
        if (!project || project.length == 0) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
          Logger.logInfo('project not found');
          return response;
        }
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, project.filterData());
        Logger.logInfo('Successfully Updated project!');
        return response;
      }).catch((error) =>{
        response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }


  /**
   * Allows Company to close project post
   * @param {*} projectId
   * @return {DevResponse}
   */
  async closeProject(projectId) {
    const response = new DevResponse();
    const closeProjectSettings = {
      Fulfilled: true,
    };
    return this.Persister.updateProject(projectId, closeProjectSettings).then((project) =>{
      if (!project || project.length == 0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo('project not found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, project);
      Logger.logInfo('Successfully Closed project!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to deactivate job post
   * @param {*} projectId
   * @return {DevResponse}
   */
  async deactivateProject(projectId) {
    const response = new DevResponse();
    const deactivateProjectSettings = {
      isdeactivated: true,
    };
    return this.Persister.updateProject(projectId, deactivateProjectSettings).then((project) =>{
      if (!project || project.length==0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo('project not found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, project);
      Logger.logInfo('Successfully Deactivated project!');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdatePostError, error);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to add new questions
   * @param {Object} company holds company id and project title
   * @param {Object} questionData holds project data
   * @return {DevResponse}
   */
  async addQuestions(company, questionData) {
    const response = new DevResponse();
    // validation check
    const returnedValidation = validateQuestions(questionData);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.verifyProjectUnique(company.id, company.projectTitle).then((project)=>{
      if (!project || project.length == 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.PostNotFound);
        Logger.logInfo('Post does not exist');
        return response;
      } else if ( 'questions' in project && project.questions.length + questionData.length > process.env.NbQuestions) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.QuestionOutOfBound, project.questions.length);
        Logger.logInfo(VadlidationStatus.QuestionOutOfBound);
        return response;
      }
      let questionIndex = 0;
      if ( 'questions' in project ) questionIndex = project.questions.length;
      const questions=[];
      questionData.forEach((question, index)=>{
        questions.push({
          id: index + questionIndex,
          question: question,
        });
      });
      return this.Persister.addQuestions(company.id, company.projectTitle, questions)
          .then((projectUpdated) =>{
            if (!projectUpdated) {
              response.fillResponse( APIStatus.Failed, VadlidationStatus.PostNotFound);
              Logger.logInfo('Post does not exist');
              return response;
            } else {
              response.fillResponse( APIStatus.Successful, VadlidationStatus.SuccessfulAddQuestion);
              Logger.logInfo('Post successfully added questions');
              return response;
            }
          }).catch((error) => {
            response.fillResponse( APIStatus.Failed, VadlidationStatus.AddQuestionError);
            Logger.logInfo(error.message);
            return response;
          });
    }).catch((error) => {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to update new questions
   * @param {Object} company holds company id and project title
   * @param {Number} index question position to be updated
   * @param {Object} questionData holds project data
   * @return {DevResponse}
   */
  async updateQuestions(company, index, questionData) {
    const response = new DevResponse();
    // validation check
    if (typeof questionData != 'string') {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongQuestionType2);
      Logger.logInfo(VadlidationStatus.WrongQuestionDescription);
      return response;
    }
    if (questionData.length >250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongQuestionDescription);
      Logger.logInfo(VadlidationStatus.WrongQuestionDescription);
      return response;
    } else if (index > process.env.NbQuestions - 1 || index < 0) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.IndexOutOfBound);
      Logger.logInfo(VadlidationStatus.IndexOutOfBound);
      return response;
    }
    return this.Persister.verifyProjectUnique(company.id, company.projectTitle).then((project)=>{
      if (!project || project.length == 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.ProjectNotFound);
        Logger.logInfo('Post does not exist');
        return response;
      } else if (project.questions.length<= index) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.IndexOutOfBound);
        Logger.logInfo(VadlidationStatus.IndexOutOfBound);
        return response;
      }
      return this.Persister.updateQuestions(company.id, company.projectTitle, index, questionData)
          .then((projectUpdated) =>{
            if (!projectUpdated) {
              response.fillResponse( APIStatus.Failed, VadlidationStatus.PostNotFound);
              Logger.logInfo('Post does not exist');
              return response;
            } else {
              response.fillResponse( APIStatus.Successful, VadlidationStatus.SuccessfulAddQuestion);
              Logger.logInfo('Post successfully added questions');
              return response;
            }
          }).catch((error) => {
            response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateQuestionError);
            Logger.logInfo(error.message);
            return response;
          });
    }).catch((error) => {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindPostError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to add new questions
   * @param {Object} company holds company id and job title
   * @param {Object} questionData holds job data
   * @return {DevResponse}
   */
  async addJobQuestions(company, questionData) {
    const response = new DevResponse();
    // validation check
    const returnedValidation = validateQuestions(questionData);
    if (returnedValidation != VadlidationStatus.Successful) {
      response.fillResponse(APIStatus.Failed, returnedValidation);
      Logger.logInfo(returnedValidation);
      return response;
    }
    return this.Persister.verifyJobUnique(company.id, company.jobTitle).then((job)=>{
      if (!job || job.length == 0) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.JobNotFound);
        Logger.logInfo('Job does not exist');
        return response;
      } else if (job.questions.length + questionData.length > process.env.NbQuestions) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.QuestionOutOfBound, job.questions.length);
        Logger.logInfo(VadlidationStatus.QuestionOutOfBound);
        return response;
      }
      const questions=[];
      questionData.forEach((question, index)=>{
        questions.push({
          id: index + job.questions.length,
          question: question,
        });
      });
      return this.Persister.addJobQuestions(company.id, company.jobTitle, questions)
          .then((jobUpdated) =>{
            if (!jobUpdated) {
              response.fillResponse( APIStatus.Failed, VadlidationStatus.JobNotFound);
              Logger.logInfo('Job does not exist');
              return response;
            } else {
              response.fillResponse( APIStatus.Successful, VadlidationStatus.SuccessfulAddQuestion);
              Logger.logInfo('Job successfully added questions');
              return response;
            }
          }).catch((error) => {
            response.fillResponse( APIStatus.Failed, VadlidationStatus.AddQuestionError);
            Logger.logInfo(error.message);
            return response;
          });
    }).catch((error) => {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindJobError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
   * Allows Company to update new questions
   * @param {Object} company holds company id and Job title
   * @param {Number} index question position to be updated
   * @param {Object} questionData holds Job data
   * @return {DevResponse}
   */
  async updateJobQuestions(company, index, questionData) {
    const response = new DevResponse();
    // validation check
    if (typeof questionData != 'string') {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongQuestionType2);
      Logger.logInfo(VadlidationStatus.WrongQuestionDescription);
      return response;
    }
    if (questionData.length >250) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.WrongQuestionDescription);
      Logger.logInfo(VadlidationStatus.WrongQuestionDescription);
      return response;
    } else if (index > process.env.NbQuestions - 1 || index < 0) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.IndexOutOfBound);
      Logger.logInfo(VadlidationStatus.IndexOutOfBound);
      return response;
    }
    return this.Persister.verifyJobUnique(company.id, company.jobTitle).then((job)=>{
      if (!job) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.JobNotFound);
        Logger.logInfo('Job does not exist');
        return response;
      } else if (job.questions.length<= index) {
        response.fillResponse( APIStatus.Failed, VadlidationStatus.IndexOutOfBound);
        Logger.logInfo(VadlidationStatus.IndexOutOfBound);
        return response;
      }
      return this.Persister.updateJobQuestions(company.id, company.jobTitle, index, questionData)
          .then((jobUpdated) =>{
            if (!jobUpdated) {
              response.fillResponse( APIStatus.Failed, VadlidationStatus.JobNotFound);
              Logger.logInfo('Job does not exist');
              return response;
            } else {
              response.fillResponse( APIStatus.Successful, VadlidationStatus.SuccessfulAddQuestion);
              Logger.logInfo('Job successfully added questions');
              return response;
            }
          }).catch((error) => {
            response.fillResponse( APIStatus.Failed, VadlidationStatus.UpdateQuestionError);
            Logger.logInfo(error.message);
            return response;
          });
    }).catch((error) => {
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindJobError);
      Logger.logInfo(error.message);
      return response;
    });
  }
  /**
* Allows Company to get a job post and its aplicants
* @param {*} companyId
* @return {DevResponse}
*/
  async getJobsWithApplicants(companyId) {
    const response = new DevResponse();
    return this.Persister.findAllJobApp(companyId).then((applicantlist) =>{
      if (!applicantlist || applicantlist.length==0) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.PostsNotFound);
        Logger.logInfo(' applist Not Found');
        return response;
      }
      response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, applicantlist);
      Logger.logInfo('Application List Found');
      return response;
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindAllPostsError);
      Logger.logInfo(error.message);
      return response;
    });
  }

  /**
* Allows Company to get a job post and its aplicants
* @param {*} companyId
* @param {*} devId
* @param {Object} review
* @return {DevResponse}
*/
  async rateDeveloper(companyId, devId, review) {
    const response = new DevResponse();
    const finalReview = normalizeInput(review);
    if (typeof review.rating !== 'number' || review.rating > 5) {
      response.fillResponse(APIStatus.Failed, VadlidationStatus.InvalidRating);
      Logger.logInfo('invalid rating');
      return response;
    }
    return this.Persister.findCompanyOr({'_id': companyId}).then((company) =>{
      if (!company) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo(' Company Not Found');
        return response;
      }
      finalReview.CompanyName = company.company_name;
      finalReview.CompanyId = companyId;
      return this.Persister.updateDeveloper(devId, finalReview).then((dev) => {
        if (!dev) {
          response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
          Logger.logInfo(' Dev Not Found');
          return response;
        }
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful);
        Logger.logInfo('Successfully reviewed developer');
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
 * Sends emails to subscribers based on criteria
 * @param {Object} jobData
 * @return {*}
 */
  async alertSubscribers(jobData) {
    const response = new DevResponse();
    const criteria = {};
    const promises = [];
    Object.keys(jobData).forEach( (key) =>{
      if (['SeniorityLevel', 'YearsOfExperience', 'EducationLevel', 'EmploymentTime', 'JobLocation'].includes(key) && jobData[key]) {
        criteria[key] = jobData[key];
      }
    });
    this.Persister.filterByCriteria(criteria).then((subscriberList) => {
      subscriberList.forEach((subscriber) =>{
        promises.push(sendJobAlertEmail(subscriber, jobData));
      });
    }).catch((error) =>{
      response.fillResponse(APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error);
      return response;
    });
  }


  /**
   * Allows Company to get all project proposals
   * @param {String} username
   * @return {DevResponse}
   */
  async getAllProjectProposals(username) {
    const response = new DevResponse();
    return this.Persister.findCompanyOr({username: username}).then((company) => {
      if (!company) {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.NotFound);
        Logger.logInfo('Company Not Found');
        return response;
      }
      if (company.Projects.length === 0) {
        response.fillResponse(APIStatus.Successful, VadlidationStatus.NoResult);
        Logger.logInfo('No Project Proposals');
        return response;
      }
      return this.Persister.findAllProjectProposals(company._id).then((projectProposalList) => {
        const filteredProjectProposalList = [];
        projectProposalList.forEach((projectProposal)=>{
          filteredProjectProposalList.push(projectProposal.filterData());
        });
        response.fillResponse(APIStatus.Successful, VadlidationStatus.Successful, filteredProjectProposalList);
        Logger.logInfo('Successfully Found Project Proposals!');
        return response;
      }).catch((error) => {
        response.fillResponse(APIStatus.Failed, VadlidationStatus.FindAllPostsError+'sami '+ error.message);
        Logger.logInfo(error.message);
        return response;
      });
    }).catch((error) =>{
      response.fillResponse( APIStatus.Failed, VadlidationStatus.FindError);
      Logger.logInfo(error.message);
      return response;
    });
  }
}

/**
 * validate the current company
 * @param {*} finalUser the company user
 * @return {*} status
 */
function validateCompany(finalUser) {
  if (!Validator.validPassword(finalUser.password)) {
    return VadlidationStatus.WrongPassword;
  }
  if (!Validator.validateUsername(finalUser.username)) {
    return VadlidationStatus.WrongUsername;
  }
  if (
    finalUser.companyName &&
    !Validator.validFullName(finalUser.companyName)
  ) {
    return VadlidationStatus.WrongFullname;
  }
  if (finalUser.CompanyWebsite && !Validator.validateWebsite(finalUser.CompanyWebsite)) {
    return VadlidationStatus.InvalidURL;
  }
  if (finalUser.phone && !Validator.validPhoneNumber(finalUser.phone)) {
    return VadlidationStatus.WrongPhone;
  }
  if (!Validator.validEmailAddress(finalUser.email)) {
    return VadlidationStatus.WrongEmail;
  }
  return VadlidationStatus.Successful;
}

/**
 * validate the current company
 * @param {*} finalUser the company user
 * @return {*} status
 */
function validateUpdates(finalUser) {
  if (finalUser.password && !Validator.validPassword(finalUser.password)) {
    return VadlidationStatus.WrongPassword;
  }
  if (finalUser.company_name && finalUser.company_name && !(Validator.validFullName(finalUser.company_name)) ) {
    return VadlidationStatus.WrongFullname;
  }
  if (finalUser.phone && finalUser.phone && (!Validator.validPhoneNumber(finalUser.phone))) {
    return VadlidationStatus.WrongPhone;
  }
  if (finalUser.email && !Validator.validEmailAddress(finalUser.email)) {
    return VadlidationStatus.WrongEmail;
  }
  return VadlidationStatus.Successful;
}

/**
 * validate the current company
 * @param {*} data input
 * @return {Object} normalized data
 */
function normalizeInput(data) {
  let key;
  for (key in data) if (typeof data[key] === 'string') data[key]= data[key].trim();
  return data;
}

/**
 * validate job details
 * @param {Object} job details
 * @return {String} status
 */
function validateJob(job) {
  if (job.JobTitle && !Validator.validateDescription(job.JobTitle)) {
    return VadlidationStatus.WrongTitle;
  }
  if (job.JobDescription && !Validator.validateDescription(job.JobDescription)) {
    return VadlidationStatus.WrongDescription;
  }
  if (job.Email && !Validator.validEmailAddress(job.Email)) {
    return VadlidationStatus.WrongEmail;
  }
  if (job.SeniorityLevel && !Validator.validateSeniorityLevel(job.SeniorityLevel)) {
    return VadlidationStatus.InvalidSeniorityLevelInput;
  }
  if (job.YearsOfExperience && !Validator.validateYearsOfExperience(job.YearsOfExperience)) {
    return VadlidationStatus.InvalidYearsOfExperienceInput;
  }

  if (job.EducationLevel && !Validator.validateEducationLevel(job.EducationLevel)) {
    return VadlidationStatus.InvalidEducationLevelInput;
  }
  if (job.EmploymentTime && !Validator.validateEmploymentTime(job.EmploymentTime)) {
    return VadlidationStatus.InvalidEmploymentTimeInput;
  }

  if (job.MonthlySalary && !Validator.validateMonthlySalary(job.MonthlySalary)) {
    return VadlidationStatus.InvalidMonthlySalaryInput;
  }
  if (job.Skills && job.Skills.length>=0 && job.Skills.length <3) {
    return VadlidationStatus.InsufficientSkills;
  }
  return VadlidationStatus.Successful;
}


/**
 * validate project details
 * @param {Object} project details
 * @return {String} status
 */
function validateProject(project) {
  if (project.ProjectDescription && !Validator.validateDescription(project.ProjectDescription)) {
    return VadlidationStatus.WrongDescription;
  }
  if (project.Email && !Validator.validEmailAddress(project.Email)) {
    return VadlidationStatus.WrongEmail;
  }
  if (project.FixedBudget && project.ManHourBudget) return VadlidationStatus.InvalidBudgetInput;
  if (project.SeniorityLevel && !Validator.validateSeniorityLevel(project.SeniorityLevel)) {
    return VadlidationStatus.InvalidSeniorityLevelInput;
  }
  if (project.YearsOfExperience && !Validator.validateYearsOfExperience(project.YearsOfExperience)) {
    return VadlidationStatus.InvalidYearsOfExperienceInput;
  }
  return VadlidationStatus.Successful;
}
/**
 * validate porject details
 * @param {Object} questions details
 * @return {String} status
 */
function validateQuestions(questions) {
  if (!Array.isArray(questions)) {
    return VadlidationStatus.WrongQuestionType;
  }
  if (questions.length == 0) {
    return VadlidationStatus.NoQuestionsFound;
  }
  if (questions.length >3) {
    return VadlidationStatus.QuestionOutOfBound;
  }
  let invalid=false;
  questions.forEach((question)=>{
    if (question.length>250) {
      invalid=true;
    }
  });
  if (invalid) return VadlidationStatus.WrongQuestionDescription;
  return VadlidationStatus.Successful;
}


/**
   * @param {*} subscriber
   * @param {*} jobData
   * @return {*} promise
   */
function sendJobAlertEmail(subscriber, jobData) {
  return Util.sendEmail(process.env.supportEmail,
      subscriber.email,
      'New Job Posted!',
      '',
      `Check out the newly posted job ${jobData.JobTitle} , to unsubscribe, visit the link:
      ${env.app.siteurl}/developer/unsubscribe/?${Util.encodeQueryData({email: subscriber.email, UnsubscriptionKey: subscriber.UnsubscriptionKey})}`);
}

// ====================================================================
/**
 * Export module
 */
module.exports = {
  CompanyController,
  VadlidationStatus,
};
// ================================================================
