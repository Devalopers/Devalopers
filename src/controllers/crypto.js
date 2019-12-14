const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Encryption function
 * @param {*} value the value to be encrypted
 * @param {*} salt  the salt to be added
 * @return {string} encryted string in hexadecimal format
 */
function encrypt(value, salt) {
  return crypto.pbkdf2Sync(value, salt, 10000, 512, 'sha512').toString('hex');
}
/**
 * Get a random hex from a digi
 * @param {*} digit the digit to get a random hex on
 * @return {string} the hexadecimal representation of the random value
 */
function randomHex(digit) {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * the webtoken generator
 * @param {*} payload the object used to generate the token
 * @param {*} secretOrPrivateKey the application key used
 * @return {sting} the returned value of the webtoken
 */
function generateWebToken( payload,
    secretOrPrivateKey) {
  return jwt.sign(payload, process.env.secret);
}

module.exports={encrypt: encrypt, randomHex: randomHex, generateWebToken: generateWebToken};
