import {createSchema, registerModel} from './MongooseHelper.js';
import {Schema} from 'mongoose';

const SavedJobsModel = createSchema({
  username: {
    type: String,
    required: true,
  },
  jobID: {
    type: Schema.Types.ObjectId,
    ref: 'JobModel',
    required: true,
  },
}, {
  timestamps: true, capped: process.env.MAXDBFETCH,
});


registerModel('SavedJobsModel', SavedJobsModel);

