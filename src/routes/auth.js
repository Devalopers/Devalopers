const jwt = require('express-jwt');

const getTokenFromHeaders = (req) => {
  const {headers: {authorization}} = req;

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  return null;
};

const auth = {
  required: jwt({
    secret: process.env.secret,
    userProperty: 'fusioncore',
    getToken: getTokenFromHeaders,
  }),
  optional: jwt({
    secret: process.env.secret,
    userProperty: 'fusioncore',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
  }),
};

module.exports = auth;
