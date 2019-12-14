
const passport = require('passport');
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const {AdminController, VadlidationStatus} = require('../controllers/admincontroller');
const {AdminPersister} = require('../controllers/persistence/adminpersister');
const APIStatus = require('../models/classes/DevResponse').APIStatus;
const Logger = require('../controllers/logger');

/**
 * Message Response
 * @param {*} status APIStatus
 * @param {*} message ValidationStatus message
 * @param {*} data returned data
 * @return {Object} Server Response
 */
function serverResponse(status, message, data) {
  return {
    Status: status,
    message: message,
    data: data,
  };
}

const checkToken = (req, res, next) => {
  const header = req.headers['authorization'];

  if (typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];

    req.token = token;
    next();
  } else {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
};

router.get('/', (req, res) =>{
  res.send('Admin Page');
});

// POST new user route (optional, everyone has access)
router.post('/createProfile', auth.optional, (req, res) =>{
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  const admin = req.body;

  if (!admin.username) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'username is required'));
  }
  if (!admin.email) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'email is required'));
  }

  if (!admin.password) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'password is required'));
  }

  const promise= controller.createNewAdmin(admin);
  promise.then((response)=>{
    if (APIStatus.Failed === response.getStatus()) {
      return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
    }
    return res.status(200).json(serverResponse(response.getStatus(), 'User Successfuly Created', response.getData()));
  });
});

// POST login route (optional, everyone has access)

router.post('/login', auth.optional, (req, res, next) => {
  const admin = req.body;
  let usedStrategy;
  if (!admin.username && !admin.email) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'username or email is required'));
  }
  if (!admin.password) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'password is required'));
  }
  if (admin.email && !admin.username) {
    usedStrategy = 'Admin-local-email';
  } else {
    usedStrategy = 'Admin-local-username';
  }
  return passport.authenticate(usedStrategy, {
    session: false,
  }, (err, returnedAuth, info) => {
    if (err) {
      return next(err);
    }
    const [passportUser, response] = returnedAuth;
    if (!passportUser) {
      return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
    }
    const user = passportUser;
    user.token = passportUser.generateJWT();
    return res.status(200).json(serverResponse(response.getStatus(), 'Successfuly Logged In', user.toAuthJSON()));
  })(req, res, next);
});

// GET viewProfile route (required, only authenticated users have access)

router.get('/viewProfile', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      const promise= controller.getAdmin(authorizedData.username);
      promise.then((response)=>{
        if (APIStatus.Failed === response.getStatus()) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), 'Successfully retrieved Profile', response.getData()));
      });
      Logger.logInfo('SUCCESS: Connected to protected route');
    }
  });
});


router.post('/updateProfile', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const admin = req.body;
      if (Object.keys(admin).length == 0) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'at least one field is required to update account'));
      }

      if (admin.username) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'username cannot be changed'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      const promise= controller.updateAdmin(authorizedData.username, admin);
      promise.then((response)=>{
        if (APIStatus.Failed === response.getStatus()) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), 'Successfully Updated Profile', response.getData()));
      });
    }
  });
});


router.post('/deactivateProfile', checkToken, (req, res) =>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      Logger.logInfo('SUCCESS: Connected to protected route');
      const promise= controller.deactivateAdmin(authorizedData.username);
      promise.then((response)=>{
        if (response.getStatus()=== APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(response.getStatus(), response.getMessage())
          );
        }
        return res.status(200).json(serverResponse(response.getStatus(), 'Profile Deactivated Successfully' ));
      });
    }
  });
});


router.get('/verifyemail', (req, res) => {
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  const email = req.query.email;
  const verifier = req.query.verifier;
  let outputMessage;
  if (email === undefined) {
    outputMessage = 'Email was not verified, since it doesn\'t exist or token expired, please send email to '
     + process.env.email_user;
    return res.status(400).json(serverResponse(APIStatus.Failed, outputMessage));
  }
  const promise= controller.checkAdminEmail(email, verifier);
  promise.then((response)=>{
    if (response.getStatus() === APIStatus.Failed) {
      if (response.getMessage() === VadlidationStatus.NotFound) {
        outputMessage = 'Email was not verified, since it doesn\'t exist or token expired, please send email to '
         + process.env.email_user;
        return res.status(400).json(serverResponse(response.getStatus(), outputMessage));
      }
      if (response.getMessage() === VadlidationStatus.PersistError) {
        outputMessage = 'Error Activating User';
        return res.status(400).json(serverResponse(response.getStatus(), outputMessage));
      }
      if (response.getMessage() === VadlidationStatus.FindError) {
        outputMessage = 'Error Finding User';
        return res.status(400).json(serverResponse(response.getStatus(), outputMessage));
      }
    }
    if (response.getMessage() === VadlidationStatus.Successful) {
      outputMessage = 'Email is successfully verified!';
      return res.status(200).json(serverResponse(response.getStatus(), outputMessage));
    }

    if (response.getMessage() === VadlidationStatus.AlreadyActive) {
      return res.status(200).json(serverResponse(response.getStatus(), VadlidationStatus.AlreadyActive));
    }
  });
});

router.get('/viewRequests', checkToken, (req, res) =>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      console.log('SUCCESS: Connected to protected route');
      const promise= controller.getRequests( );
      promise.then((response)=>{
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(422).json({
            errors: {
              message: response.getMessage(),
              error: response.getData(),
            },
          });
        } else {
          res.status(200).json({
            data: response.getData(),
          });
        }
        return res.json({
          data: response.getData(),
        });
      });
    }
  });
});

router.post('/AcceptRequest', checkToken, (req, res) =>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      console.log('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      const username=req.body.username;
      if (!username) {
        return res.status(422).json({
          errors: {
            username: 'is a required field',
          },
        });
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      console.log('SUCCESS: Connected to protected route');
      const promise= controller.acceptRequest(username);
      promise.then((response)=>{
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(422).json({
            errors: {
              message: response.getMessage(),
              error: response.getData(),
            },
          });
        }
        return res.json({
          data: response.getData(),
        });
      });
    }
  });
});

router.post('/CreateSkill', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const skill = req.body;
      if (!skill.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill name is required'));
      }
      if (!skill.description) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill description is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.createSkill({
        SkillOwner: authorizedData.id,
        SkillName: skill.name,
        SkillDescription: skill.description,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.get('/ViewSkill', auth.optional, (req, res)=>{
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.viewSkill().then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
});

router.post('/UpdateSkill', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      // If error send Forbidden (403)
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const skill = req.body;
      if (!skill.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill name is required'));
      }
      if (!skill.description) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill description is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.updateSkill({
        SkillName: skill.name,
        SkillDescription: skill.description,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/DeactivateSkill', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      // If error send Forbidden (403)
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const skill = req.body;
      if (!skill.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill name is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.deactivateSkill({
        SkillName: skill.name,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/ReactivateSkill', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const skill = req.body;
      if (!skill.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'skill name is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.reactivateSkill({
        SkillName: skill.name,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/forgotPassword', auth.optional, (req, res, next) => {
  const admin = req.body;
  if (!admin.email) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'email is required'));
  }
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  const promise= controller.forgotPassword(admin.email);
  promise.then((response)=>{
    if (response.getStatus() === APIStatus.Failed) {
      return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
    }
    return res.status(200).json(serverResponse(response.getStatus(), 'Reset Password Link Sent Successfully'));
  });
});
router.post('/resetPassword/:code', (req, res) => {
  const Persister=new AdminPersister();
  const controller=new AdminController(Persister);
  const passwordCode = req.params.code;
  const admin = req.body;
  if (!admin.password) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'password is required'));
  }
  const promise= controller.resetPassword(passwordCode, admin.password);
  promise.then((response)=>{
    if (response.getStatus() === APIStatus.Failed) {
      return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
    }
    return res.status(200).json(serverResponse(response.getStatus(), 'Successfully Reset Password'));
  });
});

router.post('/CreateStatus', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const status = req.body;
      if (!status.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status name is required'));
      }
      if (!status.description) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status description is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.createStatus({
        StatusOwner: authorizedData.id,
        StatusName: status.name,
        StatusDescription: status.description,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/UpdateStatus', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const status = req.body;
      if (!status.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status name is required'));
      }
      if (!status.description) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status description is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.updateStatus({
        StatusName: status.name,
        StatusDescription: status.description,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/DeactivateStatus', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const status = req.body;
      if (!status.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status name is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.deactivateStatus({
        StatusName: status.name,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/ReactivateStatus', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const status = req.body;
      if (!status.name) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'status name is required'));
      }
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.reactivateStatus({
        StatusName: status.name,
      }).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.get('/ViewStatus', checkToken, (req, res)=>{
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      controller.viewStatus().then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
});

router.post('/assignStatus', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      // If token is successfully verified, we can send the autorized data
      const status = req.body.status;
      const company = req.body.company;
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      const promise= controller.assign({username: company}, {StatusName: status});
      promise.then((response)=>{
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});

router.post('/depriveStatus', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const status = req.body.status;
      const company = req.body.company;
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      const promise= controller.deprive({username: company}, {StatusName: status});
      promise.then((response)=>{
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
        }
        return res.status(200).json(serverResponse(response.getStatus(), response.getMessage(), response.getData()));
      });
    }
  });
});


router.post('/createDeveloperStatus', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const developerStatusRequest = req.body;
      const controller=new AdminController(new AdminPersister());
      const promise= controller.createDeveloperStatus(developerStatusRequest.name, developerStatusRequest.description);
      promise.then((devResponse) => {
        if (devResponse.getStatus() === APIStatus.Successful) {
          return res.status(200).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.CannotPersistDeveloperStatus ||
            devResponse.getMessage() === VadlidationStatus.CannotSearchForDeveloperStatus) {
          return res.status(500).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.DeveloperStatusAlreadyExists ||
            devResponse.getMessage() === VadlidationStatus.InvalidName ||
            devResponse.getMessage() === VadlidationStatus.InvalidDescription) {
          return res.status(422).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
      });
    }
  });
});

router.post('/updateDeveloperStatus', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const updateDeveloperStatusRequest = req.body;
      const controller=new AdminController(new AdminPersister());
      const promise= controller.updateDeveloperStatus(
          updateDeveloperStatusRequest.name, updateDeveloperStatusRequest.description
      );
      promise.then((devResponse) => {
        if (devResponse.getStatus() === APIStatus.Successful) {
          return res.status(200).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.CannotSearchForDeveloperStatus ||
            devResponse.getMessage() === VadlidationStatus.CannotUpdateDeveloperStatus) {
          return res.status(500).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.DeveloperStatusNotFound) {
          return res.status(404).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.InvalidName ||
            devResponse.getMessage() === VadlidationStatus.InvalidDescription) {
          return res.status(422).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
      });
    }
  });
});

router.post('/deactivateDeveloperStatus', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const updateDeveloperStatusRequest = req.body;
      const controller=new AdminController(new AdminPersister());
      const promise= controller.deactivateDeveloperStatus(
          updateDeveloperStatusRequest.name, updateDeveloperStatusRequest.description
      );
      promise.then((devResponse) => {
        if (devResponse.getStatus() === APIStatus.Successful) {
          return res.status(200).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.CannotUpdateDeveloperStatus ||
            devResponse.getMessage() === VadlidationStatus.CannotSearchForDeveloperStatus) {
          return res.status(500).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.DeveloperStatusNotFound) {
          return res.status(404).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
        if (devResponse.getMessage() === VadlidationStatus.DeveloperStatusAlreadyDeactivated) {
          return res.status(422).json(serverResponse(devResponse.getStatus(), devResponse.getMessage()));
        }
      });
    }
  });
});

router.post('/deactivateUserProfile', checkToken, (req, res) =>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      Logger.logError('ERROR: Could not connect to the protected route');
      res.status(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const username = req.body.username;
      const userType = req.body.type;
      const Persister=new AdminPersister();
      const controller=new AdminController(Persister);
      Logger.logInfo('SUCCESS: Connected to protected route');
      const promise= controller.deactivateUserProfile(username, userType);
      promise.then((response)=>{
        if (response.getStatus()=== APIStatus.Failed) {
          return res.status(400).json(
              serverResponse(response.getStatus(), response.getMessage())
          );
        }
        return res.status(200).json(serverResponse(response.getStatus(), 'User Profile Deactivated Successfully' ));
      });
    }
  });
});

module.exports = router;
