const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

router.use('/company', require('./company'));
router.use('/jobs', require('./jobs'));
router.use('/admin', require('./admin'));
router.use('/developer', require('./developer'));
router.use('/verification', require('./verification'));

router.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
}).post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
}).put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
}).delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});


module.exports = router;
