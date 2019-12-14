
import {createSchema, registerModel} from './MongooseHelper.js';
import {randomHex, encrypt, generateWebToken} from '../controllers/crypto';

const AdminSchema = createSchema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /[a-zA-Z0-9-_@]+$/,
    minlength: 6,
    maxlength: 9,
  },

  password: {
    type: String,
    required: true,
  },

  firstname: {
    type: String,
    trim: true,
    match: /^[a-zA-Z_ ]+$/,
    maxlength: 250,
  },
  lastname: {
    type: String,
    trim: true,
    match: /^[a-zA-Z_ ]+$/,
    maxlength: 250,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 250,
  },

  phonenumber: {
    type: String, trim: true,
    match: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s/0-9]*$/,

  },
  salt: String,

  created_on: {
    type: Date,
    default: Date.now,
  },

  audit_on: {

    type: Date,
    default: Date.now,
  },

  verifier: String,

  passwordCode: String,

  Active: {
    type: Boolean,
    default: false,
  },

  isdeactivated: {
    type: Boolean,
    default: false,
  },


}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});


// Schema Methods

AdminSchema.methods.setPassword = function(password) {
  this.salt = randomHex(16);
  this.password = encrypt(password, this.salt);
};

AdminSchema.methods.validatePassword = function(password) {
  const hash =encrypt(password, this.salt);
  return this.password === hash;
};

AdminSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return generateWebToken({
    username: this.username,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, process.env.secret);
};

AdminSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    firstname: this.firstname,
    lastname: this.lastname,
    token: this.generateJWT(),
  };
};

AdminSchema.methods.filterData = function() {
  return {
    username: this.username,
    email: this.email,
    firstname: this.firstname,
    lastname: this.lastname,
    phonenumber: this.phonenumber,
    verifier: this.verifier,
  };
};


// Admin Model
registerModel('AdminModel', AdminSchema);
