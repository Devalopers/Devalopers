/**
 *Module dependencies
 */
import {createSchema, registerModel} from './MongooseHelper.js';

const ReactivationRequestSchema = createSchema({
  username: {
    type: String,
    required: [true, 'required field'],
    unique: [true, 'Already exists'],
    trim: true,
    index: true,
    minlength: [6, 'length should be in between 6 & 9'],
    maxlength: [9, 'length should be in between 6 & 9'],
  },
  email: {
    type: String,
    require: true,
    unique: [true, 'Already exists'],
  },
  is_verified: {
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


registerModel('ReactivationRequestModel', ReactivationRequestSchema);

