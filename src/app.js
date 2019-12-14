
// eslint-disable-next-line no-undef
require('lodash');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
import {createExpressServer} from 'routing-controllers';
import {env} from './env';
const app = createExpressServer({cors: true,
  classTransformer: true, middlewares: env.app.dirs.middlewares});


require('./config/config.js');

const cors = require('cors');

// Loading Models into mongoose
require('./models/Admin.js');
require('./models/Company.js');
require('./models/ReactivationRequest.js');
require('./models/Skill.js');
require('./models/Status.js');
require('./models/DeveloperStatus.js');
require('./models/JobApplication.js');
require('./models/ProjectApplication.js');
require('./models/Subscriber.js');
require('./models/SavedJobs');

const passport = require('./config/passport');
const Logger = require('./controllers/logger');

let
  db; const port = env.app.port || '3000';
const dburl = env.db.mongourl || 'mongodb://localhost/test?retryWrites=true';

app.use(cors());
app.use( Logger.restlogger);

app.use('/', express.static(path.join(__dirname, '')));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true,
})).use(bodyParser.json());

app.use(cookieParser());

app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.frameguard());

app.use(fileUpload({
  limits: {fileSize: process.env.FILE_SIZE * 1024 * 1024},
}));

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes/middleware.js'));

mongoose.connect(dburl, {
  useNewUrlParser: true,
}, (err, client) => {
  if (err) return Logger.logError(err);
  db = mongoose.connection;
  db.on('error', ()=>{
    Logger.logError( 'MongoDB connection error:');
  });
  db.once('connected', function() {
    return Logger.logDebug('Successfully connected to ' + dburl);
  });
  db.once('disconnected', function() {
    return Logger.logDebug('Successfully disconnected from ' + dburl);
  });
  app.listen(port, () => {
    Logger.logDebug('new server  created on port ' + port);
  });
});

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

module.exports = app;
