const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const auth = require('./auth');

router.get('/', auth.required, (req, res, next) => {

});

module.exports = router;
