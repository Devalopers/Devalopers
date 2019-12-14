import mongoose, {Schema as _Schema, model} from 'mongoose';

const {
  Schema,
} = mongoose;

const TechProjectAppSchema = new Schema({
  Company: {
    type: _Schema.Types.ObjectId,
    ref: 'CompanyModel',
    required: true,
  },
  Project: {
    type: _Schema.Types.ObjectId,
    ref: 'TechProject',
    required: true,
  },
  Developer: {
    type: _Schema.Types.ObjectId,
    ref: 'DeveloperModel',
    required: true,
  },
  CV: {
    type: String,
  },
  isdeactivated: {
    type: Boolean,
    default: false,
  },
  answers: [String],
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});
TechProjectAppSchema.methods.filterData = function() {
  return {
    _id: this._id,
    Company: this.Company.filterData(),
    Project: this.Project.filterData(),
    Developer: this.Developer.filterData(),
    CV: this.CV,
    answers: this.answers,
  };
};
// TechJobAppSchema.index({JobTitle: 'text', JobDescription: 'text'});

export default model('TechProjectApp', TechProjectAppSchema);
