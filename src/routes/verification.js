const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const VadlidationStatus = require('../controllers/verificationcontroller').VadlidationStatus;
const APIStatus = require('../models/classes/DevResponse').APIStatus;
const VerificationController = require('../controllers/verificationcontroller').VerificationController;
const VerificationPersistor = require('../controllers/persistence/verificationpersistor').VerificationPersistor;
// const Logger = require('../controllers/logger');

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

router.get('/verifyemail', (req, res) => {
  const Persister=new VerificationPersistor();
  const controller=new VerificationController(Persister);
  const email = req.query.email;
  const verifier = req.query.verifier;
  const user = req.query.user;
  let outputMessage;
  if (email === undefined) {
    outputMessage = 'Email was not verified, since it doesn\'t exist or token expired, please send email to '
       + process.env.email_user;
    return res.status(400).json(serverResponse(APIStatus.Failed, outputMessage));
  }
  const promise= controller.verifyEmail(email, verifier, user);
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

router.post('/resetPassword/:user/:code', (req, res) => {
  const Persister=new VerificationPersistor();
  const controller=new VerificationController(Persister);
  const passwordCode = req.params.code;
  const userType = req.params.user;
  const user = req.body;
  if (!user.password) {
    return res.status(422).json(serverResponse(APIStatus.Failed, 'password is required'));
  }
  const promise= controller.resetPassword(passwordCode, user.password, userType);
  promise.then((response)=>{
    if (response.getStatus() === APIStatus.Failed) {
      return res.status(400).json(serverResponse(response.getStatus(), response.getMessage()));
    }
    return res.status(200).json(serverResponse(response.getStatus(), 'Successfully Reset Password'));
  });
});

module.exports = router;
