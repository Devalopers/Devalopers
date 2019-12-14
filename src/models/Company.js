/**
 *Module dependencies
 */
import {Schema} from 'mongoose';
import {sign} from 'jsonwebtoken';
import {createSchema, registerModel} from './MongooseHelper.js';
import {randomHex, encrypt} from '../controllers/crypto';
import './Jobs';
import './Projects';
const CompanySchema = createSchema({
  username: {
    type: String,
    required: [true, 'required field'],
    unique: [true, 'Already exists'],
    trim: true,
    index: true,
    minlength: [6, 'length should be in between 6 & 9'],
    maxlength: [9, 'length should be in between 6 & 9'],
  },
  CompanyIndustry: {
    type: String,
    required: true,
    trim: true,
  },
  CompanyWebsite: {
    type: String,
    required: true,
    trim: true,
  },
  hash: String,
  salt: {type: String, select: true},
  company_name: {
    type: String,
    maxlength: 250,
  },
  company_description: {
    type: String,
    maxlength: 250,
  },
  company_logo: {
    type: String,
    maxlength: 250,
  },
  company_size: {
    type: Number,
    maxlength: 250,
  },
  email: {
    type: String,
    require: true,
    unique: [true, 'Already exists'],
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 250,
  },
  Jobs: [{
    type: Schema.Types.ObjectId,
    ref: 'JobModel',
  }],
  Projects: [{
    type: Schema.Types.ObjectId,
    ref: 'ProjectModel',
  }],
  company_status: {
    type: {
      type: Schema.Types.ObjectId,
      ref: 'StatusModel',
    },
  },
  rating: {
    type: [Number],
    trim: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  code_verifier: {
    type: String,
    default: '',
  },
  pwd_reset_code: {
    type: String,
    default: '',
  },
  isdeactivated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});
CompanySchema.index({company_name: 'text', company_description: 'text'});
CompanySchema.methods.setPassword = function(password) {
  this.salt = randomHex(16);
  this.hash = encrypt(password, this.salt);
};

CompanySchema.methods.validatePassword = function(password) {
  const hash =encrypt(password, this.salt);
  return this.hash === hash;
};
CompanySchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return sign({
    email: this.email,
    username: this.username,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, process.env.secret);
};

CompanySchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    phone: this.phone,
    company_name: this.company_name,
    company_description: this.company_description,
    company_logo: this.company_logo,
    created_on: this.created_on,
    company_status: this.company_status,
    company_size: this.company_size,
    rating: this.rating,
    jobs: this.jobs,
    token: this.generateJWT(),
  };
};

CompanySchema.methods.generateVerifier= function() {
  this.code_verifier = Math.random().toString(36).substring(7);
  return this.code_verifier;
};

CompanySchema.methods.generatePwdCode= function() {
  this.pwd_reset_code = Math.random().toString(36).substring(7);
  return this.pwd_reset_code;
};

CompanySchema.methods.filterData = function() {
  return {
    email: this.email,
    username: this.username,
    phone: this.phone,
    name: this.company_name,
    description: this.company_description,
    logo: this.company_logo,
    createdOn: this.created_on,
    status: this.company_status,
    size: this.company_size,
    rating: this.rating,
    jobs: this.jobs,
    CompanyWebsite: this.CompanyWebsite,
    CompanyIndustry: this.CompanyIndustry,
  };
};

registerModel('CompanyModel', CompanySchema);

