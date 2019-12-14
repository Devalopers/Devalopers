import mongoose, {Schema as _Schema, model} from 'mongoose';

const {
  Schema,
} = mongoose;

const SkillSchema = new Schema({
  SkillOwner: {
    type: _Schema.Types.ObjectId,
    ref: 'AdminModel',
  },
  SkillName: {
    type: String,
    required: [true, 'Required field'],
    unique: [true, 'Already exists'],
  },
  SkillDescription: {
    type: String,
    required: true,
  },
  isdeactivated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});
SkillSchema.methods.filterData = function() {
  return {
    SkillName: this.SkillName,
    SkillDescription: this.SkillDescription,
  };
};
export default model('SkillModel', SkillSchema);
