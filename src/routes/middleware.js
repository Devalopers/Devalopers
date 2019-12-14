const express = require('express');
const Logger= require('../controllers/logger');


// eslint-disable-next-line new-cap
const router = express.Router();

router.use(( req, res, next)=>{
  Logger.logInfo(req.protocol + '://' + req.get('host') + req.originalUrl);
  router.use(Logger.restlogger);
  router.use('/', require('./index.js'));
  next();
});
module.exports = router;
