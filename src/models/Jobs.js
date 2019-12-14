import mongoose, {Schema as _Schema, model} from 'mongoose';

const {
  Schema,
} = mongoose;

const TechJobSchema = new Schema({
  Company: {
    type: _Schema.Types.ObjectId,
    ref: 'CompanyModel',
    required: true,
  },
  JobTitle: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  JobDescription: {
    type: String,
    trim: true,
    index: true,
  },
  isRemote: {
    type: Boolean,
    default: true,
  },
  Skills: {type: Array, default: void 0},
  SeniorityLevel: String,
  YearsOfExperience: String,
  EducationLevel: String,
  EmploymentTime: String,
  WeeklyWorkingHours: String,
  MonthlySalary: String,
  ClientInteraction: Boolean,
  Presentation: Boolean,
  JobLocation: {
    type: String,
    trim: true,
  },
  Country: String,
  Traveling: Boolean,
  Onboarding: String,
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

TechJobSchema.methods.filterData = function() {
  return {
    _id: this._id,
    Company: this.Company,
    CompanyWebsite: this.CompanyWebsite,
    CompanyIndustry: this.CompanyIndustry,
    JobTitle: this.JobTitle,
    JobDescription: this.JobDescription,
    JobLocation: this.JobLocation,
    isRemote: this.isRemote,
    ThreeSkills: this.ThreeSkills,
    YearsOfExperience: this.YearsOfExperience,
    EducationLevel: this.EducationLevel,
    EmploymentTime: this.EmploymentTime,
    MonthlySalary: this.MonthlySalary,
    SeniorityLevel: this.SeniorityLevel,
    ClientInteraction: this.ClientInteraction,
    Presentation: this.Presentation,
    Traveling: this.Traveling,
    Skills: this.Skills,
    Onboarding: this.Onboarding,
    Email: this.Email,
    Fulfilled: this.Fulfilled,
  };
};

TechJobSchema.index({isRemote: 1, JobLocation: 'text'});

export default model('TechJob', TechJobSchema);
