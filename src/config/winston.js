const appRoot = require('app-root-path');
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, prettyPrint} = format;

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: process.env.maxsize,
    maxFiles: process.env.maxFiles,
    colorize: false,
    format: combine(
        timestamp(),
        prettyPrint()
    ),
  },
  console: {
    level: 'error',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
        format.colorize(),
        timestamp(),
        prettyPrint()
    ),
  },
  errorFile: {
    level: 'error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: process.env.maxsize,
    maxFiles: process.env.maxFiles,
    colorize: false,
    format: combine(
        timestamp(),
        prettyPrint()
    ),
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
  transports: [
    new (transports.Console)(options.console),
    new (transports.File)(options.errorFile),
    new (transports.File)(options.file),
  ],
  format: format.json(),
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};
module.exports = logger;
