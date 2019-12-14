import mongoose, {Schema as _Schema, model} from 'mongoose';

const {
  Schema,
} = mongoose;

const TechProjectSchema = new Schema({
  Company: {
    type: _Schema.Types.ObjectId,
    ref: 'CompanyModel',
    required: true,
    index: true,
  },
  ProjectTitle: {
    type: String,
    required: true,
    trim: true,
  },
  ProjectLength: {
    type: String,
    required: true,
    trim: true,
  },
  ProjectDescription: {
    type: String,
    required: true,
    trim: true,
  },
  YearsOfExperience: {
    type: String,
    required: true,
  },
  FixedBudget: {
    type: String,
    trim: true,
  },
  ManHourBudget: {
    type: String,
    trim: true,
  },
  SeniorityLevel: String,
  Language: {
    type: String,
    trim: true,
  },
  ETAOfDelivery: Date,

  Skills: {
    type: String,
    required: true,
    trim: true,
  },
  Email: {
    type: String,
    required: true,
    trim: true,
  },
  Fulfilled: {
    type: Boolean,
    default: false,
  },
  isdeactivated: {
    type: Boolean,
    default: false,
  },
  questions: [{
    id: {type: Number, default: 0},
    question: String,
  }],
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});

TechProjectSchema.methods.filterData = function() {
  return {
    _id: this._id,
    Company: this.Company,
    ProjectTitle: this.ProjectTitle,
    ProjectDescription: this.ProjectDescription,
    ProjectLength: this.ProjectLength,
    YearsOfExperience: this.YearsOfExperience,
    SeniorityLevel: this.SeniorityLevel,
    ManHourBudget: this.ManHourBudget,
    FixedBudget: this.FixedBudget,
    ETAOfDelivery: this.ETAOfDelivery,
    Language: this.Language,
    Email: this.Email,
    Fulfilled: this.Fulfilled,
    Skills: this.Skills,
  };
};

TechProjectSchema.index({ProjectTitle: 'text', ProjectDescription: 'text'});

export default model('TechProject', TechProjectSchema);
