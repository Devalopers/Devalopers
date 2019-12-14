import mongoose, {Schema as _Schema, model} from 'mongoose';
// TODO : remove if not used
import { thisExpression } from '@babel/types';

const {
  Schema,
} = mongoose;

const TechJobAppSchema = new Schema({
  Company: {
    type: _Schema.Types.ObjectId,
    ref: 'CompanyModel',
    required: true,
    index: true,
  },
  JobDescription: {
    type: String,
    trim: true,
  },
  Developer: {
    type: _Schema.Types.ObjectId,
    ref: 'DeveloperModel',
    required: true,
    index: true,
  },
  CV: {
    type: String,
  },
  isdeactivated: {
    type: Boolean,
    default: false,
  },
  created_on: {
    type: Date,
    default: Date.now,
  },

  audit_on: {
    type: Date,
    default: Date.now,
  },
  answers: [String],
}, {
  timestamps: true,
});

// TechJobAppSchema.index({JobTitle: 'text', JobDescription: 'text'});
TechJobAppSchema.index({Jobtitle: 'text', JobDescription: 'text'});
TechJobAppSchema.index({JobLocation: 'text', JobDescription: 'text'});

export default model('TechJobApp', TechJobAppSchema);
