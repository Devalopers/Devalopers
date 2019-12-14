import mongoose, {Schema as _Schema, model} from 'mongoose';

const {
  Schema,
} = mongoose;

const StatusSchema = new Schema({
  StatusOwner: {
    type: _Schema.Types.ObjectId,
    ref: 'AdminModel',
  },
  StatusName: {
    type: String,
    required: [true, 'Required field'],
    unique: [true, 'Already exists'],
  },
  StatusDescription: {
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

StatusSchema.methods.filterData = function() {
  return {
    StatusName: this.StatusName,
    StatusDescription: this.StatusDescription,
  };
};

export default model('StatusModel', StatusSchema);
