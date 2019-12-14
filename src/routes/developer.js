const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const auth = require('./auth');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {DeveloperController,
  RegisterDeveloperStatus,
  AccountAuthenticationStatus,
  ResetPasswordStatus,
  DeactivateDeveloperStatus,
  ReactivateDeveloperStatus,
  AddCapacityOfProjectsStatus,
  EditDeveloperSkillsStatus,
  VerifyDeveloperStatus,
  ViewProfileStatus,
  EditDeveloperStatus,
  ForgotPasswordStatus,
  SaveJobStatus,
  ViewSavedJobsStatus,} = require('../controllers/developercontroller');
import DeveloperPersistor from '../controllers/persistence/developerpersistor';
import { jobs } from 'googleapis/build/src/apis/jobs';
const APIStatus = require('../models/classes/DevResponse').APIStatus;

router.get('/', (req, res) =>{
  res.send('Developer Page');
});

/**
 * apiBody
 * @param {*} devResponse
 * @return {Object}
 */
function apiBodyHeader(devResponse) {
  return {
    status: devResponse.getStatus(),
    message: devResponse.getMessage(),
    data: devResponse.getData(),
  };
}

router.post('/registerDeveloper', auth.optional, (req, res) =>{
  const controller = new DeveloperController(new DeveloperPersistor());
  const registerDeveloperRequest = req.body;
  const promise = controller.registerDeveloper(registerDeveloperRequest);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json({...apiBodyHeader(devResponse), ...{
        developer: registerDeveloperRequest,
      }});
    }
    if (devResponse.getMessage() === RegisterDeveloperStatus.PersistorStatus.CANNOT_ADD ||
        devResponse.getMessage() === RegisterDeveloperStatus.PersistorStatus.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
    return res.status(422).json(apiBodyHeader(devResponse));
  });
});

router.post('/viewProfile', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.viewProfile(req.sessionData.username);
  promise.then((devResponse) => {
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ViewProfileStatus.DEVELOPER_DOESNT_EXIST) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ViewProfileStatus.PersistorStatus.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

/**
 * @param {*} authenticationResult
 * @param {*} res
 * @return {void}
 */
function processLoginAttemptFromAuthenticationResult(authenticationResult, res) {
  const developerController = new DeveloperController(new DeveloperPersistor());
  if (authenticationResult.status === 'authentication success') {
    const promise= developerController.canLoginForSuccessfullAuthentication(authenticationResult.developer.username);
    promise.then((devResponse)=>{
      if (devResponse.getStatus() === APIStatus.Successful) {
        return res.status(200).json(
            {
              ...apiBodyHeader(devResponse),
              ...{
                token: authenticationResult.developer.toAuthJSON(),
              },
            });
      }
      return res.status(403).json(
          {
            ...apiBodyHeader(devResponse),
            ...{
              supportEmail: devResponse.getData(),
            },
          });
    });
  }
  if (authenticationResult.status === 'authentication failure') {
    if (authenticationResult.developer) {
      const promise = developerController.notifyFailedAuthentication(authenticationResult.developer.username);
      promise.then((devResponse) => {
        if (devResponse.getStatus() === APIStatus.Failed) {
          if (devResponse.getMessage() === AccountAuthenticationStatus.ACCOUNT_UNLOCKED) {
            return res.status(422).json(apiBodyHeader(devResponse));
          }
          if (devResponse.getMessage() === AccountAuthenticationStatus.ACCOUNT_SEMILOCKED) {
            return res.status(422).json(apiBodyHeader(devResponse));
          }
          if (devResponse.getMessage() === AccountAuthenticationStatus.ACCOUNT_LOCKED) {
            return res.status(422).json({
              ...apiBodyHeader(devResponse),
              ...{
                supportEmail: devResponse.getData(),
              },
            });
          }
          if (devResponse.getMessage() === authenticationResult.DEVELOPER_DOESNT_EXIST) {
            return res.status(404).json(apiBodyHeader(devResponse));
          }
          return res.status(500).json(apiBodyHeader(devResponse));
        }
      });
    }
  }
  if (authenticationResult.status === 'not found') {
    return res.status(404).json({
      status: APIStatus.Failed,
      message: 'Developer not found',
    });
  }
  if (authenticationResult.status === 'authentication error') {
    return res.status(500).json({
      status: APIStatus.Failed,
      message: AccountAuthenticationStatus.PersistorError.CANNOT_SEARCH,
    });
  }
}

router.post('/loginByUsername', function(req, res) {
  passport.authenticate('developer-username-local', function(err, authenticationResult, info) {
    processLoginAttemptFromAuthenticationResult(authenticationResult, res);
  })(req, res);
});

router.post('/loginByEmail', function(req, res) {
  passport.authenticate('developer-email-local', function(err, authenticationResult, info) {
    processLoginAttemptFromAuthenticationResult(authenticationResult, res);
  })(req, res);
});

router.post('/forgotPassword', (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.forgotPassword(req.body.email);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ForgotPasswordStatus.DEVELOPER_NOT_FOUND) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ForgotPasswordStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === ForgotPasswordStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.post('/resetPassword', (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.resetPasswordByToken(req.body.email, req.body.token, req.body.newPassword);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ResetPasswordStatus.TOKEN_INVALID ||
              devResponse.getMessage() === ResetPasswordStatus.DEVELOPER_DOESNT_EXIST ||
              devResponse.getMessage() === ResetPasswordStatus.ValidationStatus.INVALID_PASSWORD) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ResetPasswordStatus.PersistorError.CANNOT_ADD ||
              devResponse.getMessage() === ResetPasswordStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.get('/searchDeveloper', auth.optional, (req, res) => {
  // If token is successfully verified, we can send the autorized data
  const txt={};
  txt.plain=req.query.plain;
  txt.fullname=req.query.fullname;
  txt.username=req.query.username;

  if (!txt) {
    return res.status(422).json({
      msg: 'missing search text ',
    });
  }
  const Persister=new DeveloperPersistor();
  const controller=new DeveloperController(Persister);
  const promise=controller.search(txt);
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        errors: {
          msg: response.getMessage(),
          err: response.getData(),
        },
      });
    }
    res.status(200).json({
      result: response.getData(),
    });
  });
});

router.post('/deactivateAccount', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.deactivateDeveloper(req.sessionData.username);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === DeactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === DeactivateDeveloperStatus.ACCOUNT_ALREADY_DEACTIVATED) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === DeactivateDeveloperStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === DeactivateDeveloperStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.post('/reactivateAccount', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.reactivateDeveloper(req.sessionData.username);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ReactivateDeveloperStatus.DEVELOPER_DOESNT_EXIST) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ReactivateDeveloperStatus.ACCOUNT_ALREADY_ACTIVATED) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === ReactivateDeveloperStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === ReactivateDeveloperStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.post('/addDeveloperCapacity', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.addCapacityOfProjects(req.sessionData.username, req.body.capacity);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === AddCapacityOfProjectsStatus.DEVELOPER_DOESNT_EXIST) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === AddCapacityOfProjectsStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === AddCapacityOfProjectsStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.post('/editSkills', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.editDeveloperSkills(req.sessionData.username, req.body.skills);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperSkillsStatus.DEVELOPER_DOESNT_EXIST ||
        devResponse.getMessage() === EditDeveloperSkillsStatus.SOME_SKILLS_ARE_NOT_EXISTENT) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperSkillsStatus.SOME_SKILLS_ARE_DEACTIVATED) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER ||
        devResponse.getMessage() === EditDeveloperSkillsStatus.PersistorError.CANNOT_SEARCH_FOR_SKILL ||
        devResponse.getMessage() === EditDeveloperSkillsStatus.PersistorError.CANNOT_UPDATE_DEVELOPER) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.get('/verify/:username/:verifier', auth.optional, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const promise = developerController.verifyAccount(req.params.username, req.params.verifier);
  promise.then((devResponse) => {
    if (devResponse.getMessage() === VerifyDeveloperStatus.SUCCESS) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === VerifyDeveloperStatus.INCORRECT_VERIFIER) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === VerifyDeveloperStatus.ACCOUNT_ALREADY_VERIFIED) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === VerifyDeveloperStatus.DEVELOPER_DOESNT_EXIST) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === VerifyDeveloperStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === VerifyDeveloperStatus.PersistorError.CANNOT_SEARCH) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.post('/ApplyJob', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const answers = req.body.answers;
  const jobId = req.body.jobId;
  if (!req.files || !req.files.cv) {
    return res.status(400).sendjson({
      msg: 'missing CV Upload',
    });
  }
  if (!answers) {
    return res.status(422).json({
      msg: 'missing answers field ',
    });
  }
  if (!jobId) {
    return res.status(422).json({
      msg: 'missing jobId field ',
    });
  }
  const cvFile = req.files.cv;
  const promise= developerController.applyJob(req.sessionData.username, jobId, cvFile, answers);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(422).json(apiBodyHeader(resp));
    }
    return res.status(422).json(apiBodyHeader(resp));
  });
});

router.get('/jobHistory', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const promise= developerController.jobApplicationHistory(req.sessionData.id);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(422).json(apiBodyHeader(resp));
    }
    return res.status(200).json(apiBodyHeader(resp));
  });
});

/**
  * unpackSessionState
  * @param {Request} req
  * @param {Response} res
  * @param {Function} next
  */
function unpackSessionState(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];
  jwt.verify(token, process.env.secret, (err, claims) => {
    if (err) {
      return res.status(403).json({
        status: APIStatus.Failed,
        message: 'Forbidden operation.',
      });
    }
    req.sessionData = claims;
    next();
  });
}

router.post('/ApplyProject', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const answers = req.body.answers;
  const projectId = req.body.projectId;
  if (!req.files || !req.files.cv) {
    return res.status(400).json({
      msg: 'missing CV Upload',
    });
  }
  if (!answers) {
    return res.status(422).json({
      msg: 'missing answers field ',
    });
  }
  if (!projectId) {
    return res.status(422).json({
      msg: 'missing projectId field ',
    });
  }
  const cvFile = req.files.cv;
  const promise= developerController.applyProject(req.sessionData.username, projectId, cvFile, answers);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(422).json(apiBodyHeader(resp));
    }
    return res.status(422).json(apiBodyHeader(resp));
  });
});

router.get('/ProjectApplyHistory', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const promise= developerController.projectApplicationHistory(req.sessionData.id);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(422).json(apiBodyHeader(resp));
    }
    return res.status(422).json(apiBodyHeader(resp));
  });
});
router.get('/linkFb', (req, res)=>{
  res.redirect(`${process.env.BASE_URL}/developer/auth/facebook`);
});
router.get('/auth/facebook', unpackSessionState, passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    function(req, res) {
      // Successful authentication, redirect home.
      res.send('successfully logged in with Facebook');
    });

router.post('/edit', unpackSessionState, (req, res) => {
  const controller = new DeveloperController(new DeveloperPersistor());
  const promise = controller.editDeveloper(req.sessionData.username, req.body);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperStatus.DEVELOPER_NOT_FOUND) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperStatus.CHANGING_USERNAME_FORBIDDEN) {
      return res.status(403).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === EditDeveloperStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER ||
        devResponse.getMessage() === EditDeveloperStatus.PersistorError.CANNOT_SEARCH_FOR_SKILL ||
        devResponse.getMessage() === EditDeveloperStatus.PersistorError.CANNOT_ADD) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
    return res.status(422).json(apiBodyHeader(devResponse));
  });
});

router.post('/subscribe', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const {email, SearchCriteria} = req.body;
  const requestData = {
    email: email,
    SearchCriteria: SearchCriteria,
  };

  if (!requestData.email) {
    return res.status(422).json({
      status: 'Failed',
      msg: 'missing email address',
    });
  }
  if (!requestData.SearchCriteria) {
    return res.status(422).json({
      status: 'Failed',
      msg: 'Criteria not provided',
    });
  }
  const promise= developerController.subsrcibeAlerts(req.sessionData.username, requestData);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(400).json(apiBodyHeader(resp));
    }
    return res.status(200).json(apiBodyHeader(resp));
  });
});

router.get('/unsubscribe', (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const email = req.query.email;
  const UnsubscriptionKey = req.query.UnsubscriptionKey;
  let outputMessage;
  if (email === undefined) {
    outputMessage = 'unsubscribe unsuccessful, invalid or expired token';
    return res.status(400).json({status: APIStatus.Failed, message: outputMessage});
  }
  const promise= developerController.unsubsrcibeAlerts(email, UnsubscriptionKey);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(400).json(apiBodyHeader(resp));
    }
    return res.status(200).json(apiBodyHeader(resp));
  });
});

router.post('/saveJob/:companyUsername/:jobID', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  const promise = developerController.saveJob(req.sessionData.username, req.params.companyUsername, req.params.jobID);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === SaveJobStatus.JOB_ALREADY_SAVED) {
      return res.status(422).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === SaveJobStatus.COMPANY_NOT_FOUND ||
        devResponse.getMessage() === SaveJobStatus.DEVELOPER_NOT_FOUND ||
        devResponse.getMessage() === SaveJobStatus.JOB_NOT_FOUND) {
      return res.status(404).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_DEVELOPER ||
        devResponse.getMessage() === SaveJobStatus.PersistorError.CANNOT_UPDATE ||
        devResponse.getMessage() === SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_JOB ||
        devResponse.getMessage() === SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_COMPANY) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});

router.get('/savedJobs', unpackSessionState, (req, res) => {
  const developerController = new DeveloperController(new DeveloperPersistor());
  if (req.body.offset === undefined) {
    return res.status(422).json(
        {
          status: 'Failed',
          message: 'offset is required',
        }
    );
  }
  if (req.body.length === undefined) {
    return res.status(422).json(
        {
          status: 'Failed',
          message: 'length is required',
        }
    );
  }
  const promise = developerController.savedJobHistory(req.sessionData.username, req.body.offset, req.body.length);
  promise.then((devResponse)=>{
    if (devResponse.getStatus() === APIStatus.Successful) {
      return res.status(200).json(apiBodyHeader(devResponse));
    }
    if (devResponse.getMessage() === SaveJobStatus.PersistorError.CANNOT_SEARCH_FOR_SAVED_JOB) {
      return res.status(500).json(apiBodyHeader(devResponse));
    }
  });
});


module.exports = router;
