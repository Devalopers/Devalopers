
const jwt = require('jsonwebtoken');
const passport = require('passport');
const express = require('express');

const router = new express.Router();
const auth = require('./auth');
const {CompanyController} = require('../controllers/companycontroller');
const {CompanyPersister} = require('../controllers/persistence/companypersister');
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

router.get('/', auth.optional, (req, res, next)=>{
  return res.send('Company Page');
});


// POST new Company route (optional, everyone has access)
router.post('/create', auth.optional, (req, res, next) => {
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const company=req.body;
  if (!company.username) {
    return res.status(422).json({
      Missing: {
        Field: 'username is required',
      },
    });
  }
  if (!company.email) {
    return res.status(422).json({
      Missing: {
        Field: 'email is required',
      },
    });
  }
  if (!company.password) {
    return res.status(422).json({
      Missing: {
        Field: 'password is required',
      },
    });
  }
  if (!company.CompanyIndustry) {
    return res.status(422).json({
      Missing: {
        Field: 'CompanyIndustry is required',
      },
    });
  }
  if (!company.CompanyWebsite) {
    return res.status(422).json({
      Missing: {
        Field: 'CompanyWebsite is required',
      },
    });
  }
  const promise= controller.createNewCompany(company);
  promise.then( (resp)=>{
    if (resp.getStatus()===APIStatus.Failed) {
      return res.status(422).json({
        error: resp.getMessage(),
      });
    }
    res.json({
      msg: resp.getMessage(),
    });
  });
});

router.post('/login', auth.optional, (req, res, next)=>{
  const user = req.body;
  if (!user.username) {
    return res.status(422).json({
      Missing: {
        Field: 'username is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      Missing: {
        Field: 'password is required',
      },
    });
  }

  return passport.authenticate('Company-local', {session: false}, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser && !passportUser.isdeactivated) {
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.status(200).json({
        msg: 'Successfuly Logged In',
        data: user.toAuthJSON(),
      });
    }
    if (passportUser.isdeactivated) {
      return res.status(400).json({
        failed: 'User Deactivated please go to /reactivate to request site admins for account reactivation',
      });
    } else {
      return res.status(400).json({
        failed: 'Login failed',
      });
    }
  }
  )(req, res, next);
});

const checkToken = (req, res, next) => {
  const header = req.headers.authorization;
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


router.get('/viewProfile', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      // If error send Forbidden (403)
      Logger.logError('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      // If token is successfully verified, we can send the autorized data
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise=controller.getProfile(authorizedData.username);
      promise.then( (response)=>{
        if (response.getStatus()== APIStatus.Failed) {
          return res.status(404).json({
            error: response.getMessage(),
          });
        }
        res.json({
          data: response.getData(),
        });
      });
      Logger.logInfo('SUCCESS: Connected to protected route');
    }
  });
});

router.post('/updateProfile', checkToken, (req, res)=>{
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      // If error send Forbidden (403)
      Logger.logError('ERROR: Could not connect to the protected route');
      res.sendStatus(403);
    } else {
      Logger.logInfo('SUCCESS: Connected to protected route');
      const company = req.body;
      if (Object.keys(company).length == 0) {
        return res.status(422).json({
          Missing: {
            Fields: 'at least one field is required to update account',
          },
        });
      }
      if (company.username) {
        return res.status(422).json({
          error: 'username cannot be changed',
        });
      }
      if (company.hash || company.salt) {
        return res.status(422).json({
          error: 'password related fields cannot be changed',
        });
      }
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      controller.updateCompany(authorizedData.username, company).then((response) => {
        if (response.getStatus()===APIStatus.Failed) {
          return res.status(422).json({
            message: response.getMessage(),
            data: response.getData(),
          });
        } else {
          res.json({
            message: response.getMessage(),
            data: response.getData(),
          });
        }
      });
    }
  });
});


router.get('/fetch', auth.optional, (req, res, next)=>{
  const queryId = req.query.id;
  const queryEmail = req.query.email;
  if (!queryEmail && !queryId) {
    return res.status(422).json({
      Missing: {
        Field: 'Email or Id is required',
      },
    });
  }

  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);

  const promise=controller.fetchCompany({_id: queryId, email: queryEmail});
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
      });
    }
    return res.json({
      data: response.getData(),
    });
  });
});

router.get('/fetchJob', auth.optional, (req, res, next)=>{
  const queryId = req.query.id;
  if (!queryId) {
    return res.status(422).json({
      Missing: {
        Field: 'id is required',
      },
    });
  }

  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);

  const promise=controller.fetchJob({id: queryId});
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
        msg: response.getData(),
      });
    }
    return res.json({
      data: response.getData(),
    });
  });
});


router.post('/verify', auth.optional, (req, res)=>{
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const username=req.body.username;
  const code=req.body.code;
  if (!username || !code) {
    return res.status(422).json({
      msg: 'missing username or code',
    });
  }

  controller.validateEmailCode({username, code}).then((response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        errors: {
          msg: response.getMessage(),
        },
      });
    }
    return res.json({
      msg: response.getMessage(),
    });
  });
});

/*
//send email with Password reset code to user
*/
router.post('/sendPsd', auth.optional, (req, res, next)=>{
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const email=req.body.email;
  if (!email) {
    return res.status(422).json({
      Missing: {
        Field: 'email is required',
      },
    });
  }
  const promise= controller.sendPasswordCode(email);
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
      });
    } return res.json({
      data: response.getData(),
    });
  });
});

router.post('/reset', auth.optional, (req, res)=>{
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const email=req.body.email;
  const code=req.body.code;
  const newPassword=req.body.newPassword;
  if (!email || !code || !newPassword) {
    return res.status(422).json({
      Missing: {
        Field: 'email and code and new password are required',
      },
    });
  }
  const promise=controller.resetPassword({email, newPassword, code}); promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
      });
    }
    return res.json({
      data: response.getMessage(),
    });
  });
});

router.get('/deactivate', checkToken, (req, res) => {
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      // If error send Forbidden (403)
      res.sendStatus(403).json({
        error: 'could not connect to the protected route',
      });
    } else {
      // If token is successfully verified, we can send the autorized data
      const promise= controller.deactivate({username: authorizedData.username}); promise.then( (response)=>{
        if (response.getStatus()== APIStatus.Failed) {
          return res.status(404).json({
            error: response.getMessage(),
          });
        }
        return res.json({
          data: response.getMessage(),
        });
      });
    }
  });
});

router.post('/reactivate', auth.optional, (req, res) => {
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const email=req.body.email;
  const username=req.body.username;
  if (!email || !username) {
    return res.status(422).json({
      // TODO fix all missing field objects to only missing
      Missing: 'missing email or username',
    });
  }
  const promise=controller.reactivate({username, email}); promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
      });
    }
    return res.json({
      data: response.getData(),
    });
  });
});

router.get('/jobPosts', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getAllJobs(authorizedData.username);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        if (typeof resp.getData() == 'undefined') {
          return res.status(200).json(
              serverResponse(resp.getStatus(), 'No jobs posted yet')
          );
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully found jobs', resp.getData())
        );
      });
    }
  });
});

router.get('/jobPosts/getJobWithCompany/:id', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const jobId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getJobWithCompany(jobId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully found job with company', resp.getData())
        );
      });
    }
  });
});
router.get('/jobPosts/getJobsWithApplicants/', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.status(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getJobsWithApplicants(authorizedData.id);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        const result = [];
        resp.getData().forEach((app) => {
          result.push({
            JobTitle: app.JobTitle,
            answers: app.answers,
            CompanyName: app.CompanyName,
            CV: app.CV,
            DeveloperNamme: app.DeveloperNamme,
          });
        });
        console.error(result);
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully found jobs with Applicants', result)
        );
      });
    }
  });
});

router.post('/jobPosts/getJobsWithApplicants/rateDeveloper/:id', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.status(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const review = req.body;
      if (!review.rating) return res.status(422).json(serverResponse(APIStatus.Failed, 'rating is required'));
      if (!review.comment) return res.status(422).json(serverResponse(APIStatus.Failed, 'comment is required'));
      const promise= controller.rateDeveloper(authorizedData.id, req.params.id, review);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully reviewed developer', resp.getData())
        );
      });
    }
  });
});

router.get('/jobPosts/:id', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const jobId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getJob(jobId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        res.json(
            serverResponse(resp.getStatus(), 'Successfully fetched job post', resp.getData().filterData())
        );
      });
    }
  });
});

router.post('/jobPosts/createJob', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const job = req.body;
      const jobAttributes = Object.keys(job);
      const requiredAttributes = ['JobTitle', 'Email', 'CompanyIndustry', 'CompanyWebsite'];
      requiredAttributes.forEach( (key) =>{
        if (!jobAttributes.includes(key)) {
          return res.status(422).json(serverResponse(APIStatus.Failed, '' + key + ' is required'));
        }
      });
      const promise= controller.createJob({id: authorizedData.id, username: authorizedData.username}, job);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        res.json(
            serverResponse(resp.getStatus(), 'Successfully created jobs', resp.getData().filterData())
        );
      });
    }
  });
});
router.get('/searchCompany', auth.optional, (req, res) => {
  if (Object.keys(req.query).length === 0) {
    return res.status(422).json({
      Missing: 'search text is required',
    });
  }
  const txt={};
  txt.plain=req.query.plain;
  txt.company_name=req.query.company_name;
  txt.company_description=req.query.company_description;
  txt.company_size=req.query.company_size;
  txt.phone=req.query.phone;
  txt.company_status=req.query.company_status;
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const promise=controller.search(txt);
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
      });
    }
    res.json({
      result: response.getData(),
    });
  });
});
router.get('/searchJob', auth.optional, (req, res) => {
  if (Object.keys(req.query).length === 0) {
    return res.status(422).json({
      Missing: 'search text is required',
    });
  }
  const txt={};
  txt.plain=req.query.text;
  txt.CompanyIndustry=req.query.CompanyIndustry;
  txt.JobTitle=req.query.JobTitle;
  txt.JobDescription=req.query.JobDescription;
  txt.MonthlySalary=req.query.MonthlySalary;
  txt.JobLocation=req.query.JobLocation;
  const Persister=new CompanyPersister();
  const controller=new CompanyController(Persister);
  const promise=controller.searchJob(txt);
  promise.then( (response)=>{
    if (response.getStatus()== APIStatus.Failed) {
      return res.status(404).json({
        error: response.getMessage(),
        msg: response.getData(),
      });
    }
    res.json({
      result: response.getData(),
    });
  });
});
router.post('/jobPosts/:id/updateJob', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const jobId = req.params.id;
      const jobData = req.body;
      if (Object.keys(jobData).length == 0) {
        return res.status(422).json(
            serverResponse(APIStatus.Failed, 'At least one field is required')
        );
      }
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.updateJob(authorizedData.id, jobId, jobData);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.json(
            serverResponse(resp.getStatus(), 'Successfully updated jobs', resp.getData().filterData())
        );
      });
    }
  });
});

router.post('/jobPosts/:id/closeJob', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const jobId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.closeJob(jobId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully closed job')
        );
      });
    }
  });
});

router.post('/jobPosts/:id/deactivateJob', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const jobId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.deactivateJob(jobId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully deactivated job')
        );
      });
    }
  });
});

router.post('/projects/createProject', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'ERROR: Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const project = req.body;
      const projectAttributes = Object.keys(project);
      const requiredAttributes = ['ProjectTitle', 'ProjectLength', 'ProjectDescription', 'YearsOfExperience', 'Skills', 'Email'];
      requiredAttributes.forEach( (key) =>{
        if (!projectAttributes.includes(key)) {
          return res.status(422).json(serverResponse(APIStatus.Failed, '' + key + ' is required'));
        }
      });
      const promise= controller.createProject({id: authorizedData.id, username: authorizedData.username}, project);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        return res.status(200).json(serverResponse(resp.getStatus(), 'Successfully Created Project', resp.getData().filterData()));
      });
    }
  });
});

router.get('/projects', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getAllProjects(authorizedData.username);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.json(serverResponse(resp.getStatus(), 'Fetched all projects successfully', resp.getData()));
      });
    }
  });
});
router.get('/projects/:id', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const projectId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getProject(projectId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.json(
            serverResponse(resp.getStatus(), 'Successfully fetched project', resp.getData())
        );
      });
    }
  });
});
router.post('/projects/:id/updateProject', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const projectId = req.params.id;
      const projectData = req.body;
      if (Object.keys(projectData).length == 0) {
        return res.status(422).json(
            serverResponse(APIStatus.Failed, 'at least one field is required to update project')
        );
      }
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.updateProject(authorizedData.id, projectId, projectData);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.json(
            serverResponse(resp.getStatus(), 'Successfully updated project', resp.getData())
        );
      });
    }
  });
});
router.post('/projects/:id/closeProject', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const projectId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.closeProject(projectId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully closed project')
        );
      });
    }
  });
});
router.post('/projects/:id/deactivateProject', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'Could not connect to the protected route')
      );
    } else {
      const projectId = req.params.id;
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.deactivateProject(projectId);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.status(200).json(
            serverResponse(resp.getStatus(), 'Successfully deactivated project')
        );
      });
    }
  });
});


router.post('/projects/addQuestion', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'ERROR: Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const questions = req.body.questions;
      const projectTitle = req.body.projectTitle;
      if (!projectTitle) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Project title is required'));
      }
      if (!questions) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'At least one question is required'));
      }
      const promise= controller.addQuestions({id: authorizedData.id, projectTitle: projectTitle}, questions);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage(), resp.getData()));
        }
        return res.status(200).json(serverResponse(resp.getStatus(), 'Successfully Added Questions', resp.getData()));
      });
    }
  });
});

router.post('/projects/updateQuestion', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'ERROR: Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const question = req.body.question;
      const index = req.body.index;
      const projectTitle = req.body.projectTitle;
      if (!projectTitle) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Project title is required'));
      }
      if (!question) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Question is required'));
      }
      if (!index) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'index is required'));
      }
      const promise= controller.updateQuestions({id: authorizedData.id, projectTitle: projectTitle}, index, question);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        return res.status(200).json(serverResponse(resp.getStatus(), 'Successfully Updated Question', resp.getData()));
      });
    }
  });
});

router.post('/jobPosts/addQuestion', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'ERROR: Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const questions = req.body.questions;
      const jobTitle = req.body.jobTitle;
      if (!jobTitle) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Job title is required'));
      }
      if (!questions) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'At least one question is required'));
      }
      const promise= controller.addJobQuestions({id: authorizedData.id, jobTitle}, questions);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage(), resp.getData()));
        }
        return res.status(200).json(serverResponse(resp.getStatus(), 'Successfully Added Questions', resp.getData()));
      });
    }
  });
});

router.post('/jobPosts/updateQuestion', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(
          serverResponse(APIStatus.Failed, 'ERROR: Could not connect to the protected route')
      );
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const question = req.body.question;
      const index = req.body.index;
      const jobTitle = req.body.jobTitle;
      if (!jobTitle) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Job title is required'));
      }
      if (!question) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'Question is required'));
      }
      if (!index) {
        return res.status(422).json(serverResponse(APIStatus.Failed, 'index is required'));
      }
      const promise= controller.updateJobQuestions({id: authorizedData.id, jobTitle}, index, question);
      promise.then( (resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(serverResponse(resp.getStatus(), resp.getMessage()));
        }
        return res.status(200).json(serverResponse(resp.getStatus(), 'Successfully Updated Question', resp.getData()));
      });
    }
  });
});

router.get('/projectProposals', checkToken, (req, res) => {
  jwt.verify(req.token, process.env.secret, (err, authorizedData) => {
    if (err) {
      res.sendStatus(403).json(serverResponse(APIStatus.Failed, 'Could not connect to the protected route'));
    } else {
      const Persister=new CompanyPersister();
      const controller=new CompanyController(Persister);
      const promise= controller.getAllProjectProposals(authorizedData.username);
      promise.then((resp)=>{
        if (resp.getStatus()===APIStatus.Failed) {
          return res.status(422).json(
              serverResponse(resp.getStatus(), resp.getMessage())
          );
        }
        res.json(serverResponse(resp.getStatus(), 'Fetched all projects successfully', resp.getData()));
      });
    }
  });
});

module.exports = router;
