const morgan = require('morgan');
const winston = require('../config/winston');

const logger = morgan('combined', {
  stream: winston.stream,
});
/**
 * Logging error
 * @param {*} error the error object
 */
function logError(error) {
  winston.error(`${error.message} ${error.stack}`);
}
/**
 * Logging information
 * @param {*} message message to be logged
 */
function logInfo(message) {
  winston.info(message);
}
/**
 * Logging debug
 * @param {*} message debug message
 */
function logDebug(message) {
  winston.debug(message);
}

module.exports={restlogger: logger, logDebug: logDebug, logInfo: logInfo, logError: logError};
