import {createSchema, registerModel} from './MongooseHelper.js';
import {Schema} from 'mongoose';
import {randomHex, encrypt, generateWebToken} from '../controllers/crypto';

const DeveloperSchema = createSchema({

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
  },

  lastname: {
    type: String,
    trim: true,
  },

  location: String,

  address: String,

  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    trim: true,
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

  capacityOfProjects: {
    type: Number,
    default: 0,
  },

  verifier: String,
  Active: {
    type: Boolean,
    default: false,
  },

  reset_token: String,

  isdeactivated: {
    type: Boolean,
    default: false,
  },

  isLocked: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  facebook: String,
  tokens: [String],
  profile: {
    name: String,
    gender: String,
    picture: String,
  },

  review: [{
    _id: false,
    rating: Number,
    comment: String,
    CompanyName: String,
    CompanyId: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyModel',
    },
  }],

  gender: String,
  languages: [Object],
  seniorityLevel: String,
  yearsOfExperience: String,
  lookingFor: String,
  educationLevel: String,
  education: Object,
  skills: [Object],
  githubProfile: {
    type: String,
    required: false,
    default: undefined,
  },
  linkedInProfile: {
    type: String,
    required: false,
    default: undefined,
  },
  workExperience: {
    type: [Object],
    required: false,
    default: undefined,
  },
  certifications: {
    type: [Object],
    required: false,
    default: undefined,
  },
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});

DeveloperSchema.index({'fullname': 'text', 'username': 'text'});

DeveloperSchema.methods.setPassword = function(password) {
  this.salt = randomHex(16);
  this.password = encrypt(password, this.salt);
};

DeveloperSchema.methods.validatePassword = function(password) {
  const hash = encrypt(password, this.salt);
  return this.password === hash;
};

DeveloperSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);
  return generateWebToken({
    username: this.username,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, process.env.secret);
};

DeveloperSchema.methods.toAuthJSON = function() {
  return this.generateJWT();
};

DeveloperSchema.methods.filterData = function() {
  return {
    Name: this.firstname + ' ' +this.lastname,
  };
};

registerModel('DeveloperModel', DeveloperSchema);
