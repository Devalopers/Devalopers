const email=require('./utilities');
const Logger = require('./logger');


/**
 * test
 * @param {*} err  sa
 */
const errHandler=
  async (err)=> {
    try {
      email.sendEmail(process.env.email_sender, process.env.admin_email, 'Error', err, err);
    } catch (error) {
      Logger.logError(error);
    }
    // add file logging
    Logger.logError(err);
  };

module.exports = {
  errHandler: errHandler,
};


